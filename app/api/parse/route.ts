import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { parsePdfBuffer } from '@/lib/pipeline/webScraper';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are an expert AI recruitment data parser.
Your task is to extract information from the given text/json/image data and map it EXACTLY to the following JSON structure.
Do not hallucinate. If a value is missing, return "Not Mentioned" or null where appropriate.

Required JSON Schema:
{
  "basic_information": {
    "company_name": "string | Not Mentioned",
    "company_logo": "string | Not Mentioned",
    "opportunity_type": "string | Not Mentioned",
    "round_name": "string | Not Mentioned",
    "verified_status": "string | Not Mentioned",
    "application_deadline": "string | Not Mentioned",
    "jd_link": "string | Not Mentioned"
  },
  "eligibility": {
    "educational_qualification": "string | Not Mentioned",
    "eligible_branches": "string | Not Mentioned",
    "eligible_streams": "string | Not Mentioned",
    "passing_batch": "string | Not Mentioned",
    "minimum_cgpa_percentage": "string | Not Mentioned",
    "cutoff_criteria": "string | Not Mentioned",
    "active_backlogs_allowed": "string | Not Mentioned",
    "gender_eligibility": "string | Not Mentioned"
  },
  "job_details": {
    "job_role": "string | Not Mentioned",
    "salary_ctc": "string | Not Mentioned",
    "stipend": "string | Not Mentioned",
    "location": "string | Not Mentioned",
    "work_mode": "string | Not Mentioned",
    "employment_type": "string | Not Mentioned"
  },
  "recruitment_process": {
    "hiring_process": "string | Not Mentioned",
    "number_of_rounds": "string | Not Mentioned",
    "elimination_rounds": "string | Not Mentioned"
  },
  "schedule": {
    "event_date": "string | Not Mentioned",
    "time": "string | Not Mentioned",
    "venue": "string | Not Mentioned",
    "mode": "string | Not Mentioned"
  },
  "communication": {
    "communication_channel": "string | Not Mentioned",
    "check_inbox": "string | Not Mentioned",
    "check_spam_folder": "string | Not Mentioned",
    "timing_shared_by": "string | Not Mentioned",
    "additional_instructions": "string | Not Mentioned"
  },
  "attachments": {
    "jd_link": "string | Not Mentioned",
    "student_eligible_list": "string | Not Mentioned",
    "additional_documents": "string | Not Mentioned"
  },
  "source_metadata": {
    "issued_by": "string | Not Mentioned",
    "institution": "string | Not Mentioned",
    "reminder_notice": "string | Not Mentioned",
    "notice_type": "string | Not Mentioned"
  }
}

Return strictly the JSON object. Do not wrap it in markdown code blocks (\`\`\`json). Just the raw JSON.
`;

function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s"'><\)\],]+/g;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

async function fetchAndScrapeLink(url: string): Promise<string> {
  const FETCH_TIMEOUT = 3000; // 3 seconds timeout
  try {
    let targetUrl = url;
    
    // Google Drive direct download URL conversion
    if (url.includes('drive.google.com')) {
      const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
      const match = url.match(driveRegex);
      if (match) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    // Google Doc export conversion
    if (targetUrl.includes('docs.google.com/document')) {
      targetUrl = targetUrl
        .replace(/\/edit.*$/, '/export?format=txt')
        .replace(/\/pub.*$/, '/export?format=txt')
        .replace(/\/view.*$/, '/export?format=txt');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(targetUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Fetch failed for URL ${url} with status: ${response.status}`);
      return '';
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/pdf') || targetUrl.includes('export=download')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdf = await parsePdfBuffer(buffer);
      return pdf.text || '';
    } else {
      const text = await response.text();
      // If it's HTML, parse it with Cheerio
      if (contentType.includes('text/html') || text.trim().startsWith('<')) {
        const $ = cheerio.load(text);
        $('script, style, nav, footer, header, iframe').remove();
        return $('body').text().replace(/\s+/g, ' ').trim();
      }
      return text;
    }
  } catch (err) {
    console.error(`Failed to scrape link ${url}:`, err);
  }
  return '';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const method = formData.get('method') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    let initialJson: any = null;
    let inputContext = '';

    if (method === 'url') {
      const scraped = await fetchAndScrapeLink(content);
      if (!scraped) {
        return NextResponse.json({ error: 'Failed to scrape URL content.' }, { status: 400 });
      }
      inputContext = scraped;
    } else if (method === 'json' || method === 'text') {
      inputContext = content;
    } else if (method === 'image') {
      if (!file) {
        return NextResponse.json({ error: 'Image file required.' }, { status: 400 });
      }
      
      let mimeType = file.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'heic') mimeType = 'image/heic';
        else mimeType = 'image/jpeg';
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const promptText = `
Analyze this screenshot/image.
1. Perform high-accuracy OCR to extract EVERY SINGLE piece of text, details, contacts, links, eligibility criteria, batches, courses, branches, and company names.
2. If there are any short URLs (like tinyurl, bit.ly, t.me) or JD links, extract them exactly.
3. Map the extracted details to the requested JSON schema. Make sure you extract all eligible branches (e.g., CSE, IT, ECE, BCA, BBA, MBA, IMBA), batches (e.g., 2026 passing out batch), companies, deadlines, CTC, and stipend info without omitting any detail.
`;

      let lastError: any = null;
      let rawText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
          });
          const result = await model.generateContent([promptText, imagePart]);
          const response = await result.response;
          rawText = response.text().trim();
          if (rawText) {
            console.log(`Successfully parsed image using model: ${modelName}`);
            lastError = null;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed for image parse:`, err.message || err);
          lastError = err;
        }
      }

      if (lastError) throw lastError;

      let jsonString = rawText;
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = rawText.substring(firstBrace, lastBrace + 1);
      }
      initialJson = JSON.parse(jsonString);
    } else {
      return NextResponse.json({ error: 'Invalid method.' }, { status: 400 });
    }

    // For Text / URL / JSON inputs: initial parse
    if (!initialJson) {
      let lastError: any = null;
      let rawText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
          });
          const result = await model.generateContent([`INPUT DATA: \n${inputContext}`]);
          const response = await result.response;
          rawText = response.text().trim();
          if (rawText) {
            console.log(`Successfully parsed text using model: ${modelName}`);
            lastError = null;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed for text parse:`, err.message || err);
          lastError = err;
        }
      }

      if (lastError) throw lastError;

      let jsonString = rawText;
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = rawText.substring(firstBrace, lastBrace + 1);
      }
      initialJson = JSON.parse(jsonString);
    }

    // URL Crawling and Refinement Step
    const extractedUrls: string[] = [];
    
    // Check fields in parsed JSON for URLs
    if (initialJson.basic_information?.jd_link && initialJson.basic_information.jd_link !== 'Not Mentioned') {
      extractedUrls.push(initialJson.basic_information.jd_link);
    }
    if (initialJson.attachments?.jd_link && initialJson.attachments.jd_link !== 'Not Mentioned') {
      extractedUrls.push(initialJson.attachments.jd_link);
    }
    
    // Scan raw input text for links if not image
    if (method !== 'image' && inputContext) {
      extractedUrls.push(...extractUrlsFromText(inputContext));
    }

    const uniqueUrls = Array.from(new Set(extractedUrls)).filter(url => url.startsWith('http'));

    if (uniqueUrls.length > 0) {
      console.log('Found URLs to crawl and merge:', uniqueUrls);
      let accumulatedScrapedText = '';

      for (const url of uniqueUrls) {
        const scraped = await fetchAndScrapeLink(url);
        if (scraped) {
          accumulatedScrapedText += `\n\n--- CONTENT FROM LINK ${url} ---\n${scraped}`;
        }
      }

      if (accumulatedScrapedText.trim().length > 0) {
        console.log('Running Gemini refinement pass with crawled content...');
        const refinementPrompt = `
You are refining the parsed recruitment data.
Below is the initial JSON parsed from the screenshot/notice, followed by the crawled text/document content from the linked job description (JD) or registration URL.

Initial JSON:
${JSON.stringify(initialJson, null, 2)}

Crawled Link Content:
${accumulatedScrapedText}

Your task is to merge these two sources:
1. Correct any placeholder/missing values ("Not Specified", "Not Mentioned", null, or empty lists) in the initial JSON using the rich details in the crawled link content.
2. Ensure you extract the following details completely:
   - Eligible courses, branches, and passing batch (e.g. B.Tech All Branches, BCA, 2026 passing out batch).
   - Salary CTC and stipend details.
   - Number of hiring rounds and round description.
   - Work location, work mode, and eligibility requirements.
   - Deadline dates and times.
3. Return ONLY a valid JSON object matching the 8-section nested schema perfectly. No explanation, no markdown wrapping.
`;

        let lastRefineError: any = null;
        let refinedRawText = '';

        for (const modelName of modelsToTry) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              systemInstruction: SYSTEM_PROMPT
            });
            const result = await model.generateContent([refinementPrompt]);
            const response = await result.response;
            refinedRawText = response.text().trim();
            if (refinedRawText) {
              console.log(`Successfully refined parse using model: ${modelName}`);
              lastRefineError = null;
              break;
            }
          } catch (err: any) {
            console.warn(`Model ${modelName} failed for refinement:`, err.message || err);
            lastRefineError = err;
          }
        }

        if (!lastRefineError && refinedRawText) {
          let refinedJsonString = refinedRawText;
          const firstBrace = refinedRawText.indexOf('{');
          const lastBrace = refinedRawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            refinedJsonString = refinedRawText.substring(firstBrace, lastBrace + 1);
          }
          initialJson = JSON.parse(refinedJsonString);
        }
      }
    }

    return NextResponse.json({ opportunity: initialJson });

  } catch (error: any) {
    console.error('Parser Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse data' },
      { status: 500 }
    );
  }
}
