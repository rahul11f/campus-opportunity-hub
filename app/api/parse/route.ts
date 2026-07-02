import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { cleanExtraction } from '@/lib/pipeline/extractionCleaner';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are an expert AI recruitment data parser.
Your task is to extract information from the given text/json/image data and map it EXACTLY to the following JSON structure.
If there are multiple companies or multiple distinct roles hiring (e.g. Logiciel AI Ventures, Indifi Technologies, CallerDesk.io hiring separately), you MUST extract them as separate, independent items in the "opportunities" array. If there is only one company/role, you still wrap it in the "opportunities" array.

STRICT RULES:
- OCR may be noisy, duplicated, malformed, or partially corrupted.
- NEVER hallucinate missing facts.
- Infer only from visible evidence.
- Extract EVERY piece of text, number, date, URL, phone number, email, instruction, note, and detail from the source.
- TABLES: If the data contains tabular structures, you MUST preserve all information from the tables. Map table rows properly to the respective slots or additional_extracted_info. Do not skip any rows or columns.
- If information is genuinely missing, return null for that field. 
- However, if a slot explicitly states a negative status or "NA" in the source (e.g. 'Cut-off: NA', 'Bond to be Signed: NA', 'Gender Preference: NA'), keep it EXACTLY as "NA" or the respective negative value. Do not convert explicit "NA" indicators into null.

For each opportunity in the "opportunities" array, you must perform TWO phases of extraction:

## PHASE 1: Standard Slots
Fill the standard sections (basic_information, eligibility, job_details, recruitment_process, schedule, communication, attachments, source_metadata). Use null for any field not present in the source.

## PHASE 2: Additional Extracted Info
After filling standard slots, scan the ENTIRE source again. For EVERY remaining piece of text not captured in Phase 1 — instructions, contact details, logistics, document requirements, additional dates, notes, bullet points — create entries in "additional_extracted_info".

Each entry must have:
- "label": Human-readable title
- "category": One of "instructions", "contact", "logistics", "documents", "dates", "compensation", "eligibility", "other"
- "value": The exact extracted text

IMPORTANT: EVERY sentence, detail, and data point in the source MUST appear either in a standard slot OR in additional_extracted_info. Nothing should be lost.

Required JSON Schema:
{
  "opportunities": [
    {
      "basic_information": {
        "company_name": "string | null",
        "company_logo": "string | null",
        "opportunity_type": "string | null",
        "round_name": "string | null",
        "verified_status": "string | null",
        "application_deadline": "string | null",
        "jd_link": "string | null"
      },
      "eligibility": {
        "educational_qualification": "string | null",
        "eligible_branches": "string | null",
        "eligible_streams": "string | null",
        "passing_batch": "string | null",
        "minimum_cgpa_percentage": "string | null",
        "cutoff_criteria": "string | null",
        "active_backlogs_allowed": "string | null",
        "gender_eligibility": "string | null"
      },
      "job_details": {
        "job_role": "string | null",
        "salary_ctc": "string | null",
        "stipend": "string | null",
        "location": "string | null",
        "work_mode": "string | null",
        "employment_type": "string | null"
      },
      "recruitment_process": {
        "hiring_process": "string | null",
        "number_of_rounds": "string | null",
        "elimination_rounds": "string | null"
      },
      "schedule": {
        "event_date": "string | null",
        "time": "string | null",
        "venue": "string | null",
        "mode": "string | null"
      },
      "communication": {
        "communication_channel": "string | null",
        "check_inbox": "string | null",
        "check_spam_folder": "string | null",
        "timing_shared_by": "string | null",
        "additional_instructions": "string | null"
      },
      "attachments": {
        "jd_link": "string | null",
        "student_eligible_list": "string | null",
        "additional_documents": "string | null"
      },
      "source_metadata": {
        "issued_by": "string | null",
        "institution": "string | null",
        "reminder_notice": "string | null",
        "notice_type": "string | null"
      },
      "additional_extracted_info": [
        { "label": "string", "category": "string", "value": "string" }
      ]
    }
  ]
}

Return strictly the JSON object. Do not wrap it in markdown code blocks (\`\`\`json). Just the raw JSON.
`;

function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s"'><\)\],]+/g;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

async function localParsePdfBuffer(nodeBuffer: Buffer): Promise<string> {
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const pdfPart = {
        inlineData: {
          data: nodeBuffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      };
      console.log('Running Gemini native PDF extraction...');
      const result = await model.generateContent([
        "Extract all text from this PDF accurately. Preserve table structures as readable text or markdown. Do NOT output JSON, just the text.",
        pdfPart
      ]);
      const text = result.response.text();
      if (text) return text.trim();
    }
  } catch (err) {
    console.error('Gemini PDF parse failed, falling back to pdf-parse:', err);
  }

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(nodeBuffer);
    return data.text?.trim() || '';
  } catch (err) {
    console.error('Failed parsing PDF buffer:', err);
    return '';
  }
}

async function fetchAndScrapeLink(url: string): Promise<string> {
  const FETCH_TIMEOUT = 3000; // 3 seconds timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    // Initial request to follow redirect and get the final URL
    const response1 = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response1.ok) {
      console.warn(`Initial fetch failed for URL ${url} with status: ${response1.status}`);
      return '';
    }

    let targetUrl = response1.url || url;

    // Google Drive direct download URL conversion
    if (targetUrl.includes('drive.google.com')) {
      const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
      const match = targetUrl.match(driveRegex);
      if (match) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    // Google Doc export conversion
    let wasConverted = false;
    if (targetUrl.includes('docs.google.com/document')) {
      targetUrl = targetUrl
        .replace(/\/edit.*$/, '/export?format=txt')
        .replace(/\/pub.*$/, '/export?format=txt')
        .replace(/\/view.*$/, '/export?format=txt');
      wasConverted = true;
    }

    // If targetUrl changed (e.g. converted to Google Doc export format), fetch again
    let finalResponse = response1;
    if (wasConverted || targetUrl !== response1.url) {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT);
      finalResponse = await fetch(targetUrl, {
        signal: controller2.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId2);
    }

    const contentType = finalResponse.headers.get('content-type') || '';
    
    if (contentType.includes('application/pdf') || targetUrl.includes('export=download')) {
      const arrayBuffer = await finalResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return await localParsePdfBuffer(buffer);
    } else {
      const text = await finalResponse.text();
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

      let isPdf = mimeType === 'application/pdf';
      const promptText = isPdf 
        ? "Extract all text and tables from this document accurately. Preserve table structures as readable text or markdown."
        : `Please transcribe all text visible in this image accurately.
IMPORTANT: If you see any URLs (links) that are split across multiple lines, you MUST reconstruct them into a single continuous URL without any spaces or line breaks.
Do not format as markdown. Just output the raw text.`;

      let lastError: any = null;
      let rawText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([promptText, imagePart]);
          const response = await result.response;
          rawText = response.text().trim();
          if (rawText) {
            console.log(`Successfully transcribed image using model: ${modelName}`);
            lastError = null;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed for image transcription:`, err.message || err);
          lastError = err;
        }
      }

      if (lastError) throw lastError;

      // Feed transcription into inputContext so the text parsing pipeline can handle it
      inputContext = rawText;
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
    
    // Extract ALL URLs present anywhere inside the initial JSON structure
    const initialJsonString = JSON.stringify(initialJson);
    extractedUrls.push(...extractUrlsFromText(initialJsonString));
    
    // Scan raw input text for links
    if (inputContext) {
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
1. The initial JSON contains an array of "opportunities". For each opportunity, correct any null or empty values using the rich details in the crawled link content if the link content refers to that specific company/role.
2. If the crawled link content contains details for a new company or role that was not in the initial JSON, add a new opportunity object to the "opportunities" array.
3. Ensure you extract the following details completely for each company/role:
   - Eligible courses, branches, and passing batch (e.g. B.Tech All Branches, BCA, 2026 passing out batch).
   - Salary CTC and stipend details.
   - Number of hiring rounds and round description.
   - Work location, work mode, and eligibility requirements.
   - Deadline dates and times.
4. MERGE "additional_extracted_info" from both sources for each opportunity. Add NEW entries for any additional details found in the crawled content that aren't already captured. Do NOT remove existing entries.
5. If a slot explicitly states "NA" or a negative value in the source, keep it EXACTLY as "NA" or the respective negative value.
6. Return ONLY a valid JSON object matching the schema: { "opportunities": [...] }. No explanation, no markdown wrapping.
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

    // Apply post-extraction cleaning to strip any remaining placeholders
    let rawObj = initialJson;
    if (rawObj && !rawObj.opportunities) {
      rawObj = { opportunities: [rawObj] };
    }

    const { data: cleanedOpportunity, populatedSections, populatedFieldCount } = cleanExtraction(rawObj);

    let totalAddInfo = 0;
    if (Array.isArray(cleanedOpportunity.opportunities)) {
      cleanedOpportunity.opportunities.forEach((o: any) => {
        if (Array.isArray(o.additional_extracted_info)) {
          totalAddInfo += o.additional_extracted_info.length;
        }
      });
    }

    return NextResponse.json({
      opportunity: cleanedOpportunity,
      extraction_stats: {
        populated_sections: populatedSections,
        populated_field_count: populatedFieldCount,
        additional_info_count: totalAddInfo,
      },
    });

  } catch (error: any) {
    console.error('Parser Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse data' },
      { status: 500 }
    );
  }
}
