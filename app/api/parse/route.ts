import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are an expert AI recruitment data parser.
Your task is to extract information from the given text/json/image data and map it EXACTLY to the following JSON structure.
Do not hallucinate. If a value is missing, return null for it.

Required JSON Schema:
{
  "company": "Company Name",
  "role": "Job Title/Role",
  "type": "placement" | "internship" | "hackathon" | "scholarship" | "campus_drive" | "other",
  "salary": "String describing salary or stipend",
  "location": "Job Location",
  "apply_link": "URL to apply",
  "instructions": "Any additional notes",
  "deadline": "ISO date string or null",
  "tags": ["tag1", "tag2"],
  "skills": ["skill1", "skill2"],
  "responsibilities": ["resp1", "resp2"],
  "eligibility": {
    "branches": ["CSE", "IT", "ECE"],
    "cgpa": "Minimum CGPA/Percentage",
    "backlog": "Backlog criteria",
    "batch": "Passing year e.g. 2024",
    "other": "Any other eligibility criteria"
  },
  "interview_process": {
    "rounds": 3,
    "description": ["Online Test", "Technical Interview", "HR Round"]
  }
}

Return strictly the JSON object. Do not wrap it in markdown code blocks (\`\`\`json). Just the raw JSON.
`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const method = formData.get('method') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    let inputContext = '';

    if (method === 'url') {
      try {
        const response = await fetch(content);
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header').remove();
        inputContext = $('body').text().replace(/\s+/g, ' ').trim();
      } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch URL content.' }, { status: 400 });
      }
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
      
      // Try to parse using available models in fallback order
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
      let lastError: any = null;
      let rawText = '';

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType
        }
      };

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
          });
          const result = await model.generateContent(["Extract the data from this image.", imagePart]);
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

      if (lastError) {
        throw lastError;
      }
      
      // Robust JSON extraction
      let jsonString = rawText;
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = rawText.substring(firstBrace, lastBrace + 1);
      }
      
      return NextResponse.json({ opportunity: JSON.parse(jsonString) });
    } else {
      return NextResponse.json({ error: 'Invalid method.' }, { status: 400 });
    }

    // Process Text/URL/JSON
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
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

    if (lastError) {
      throw lastError;
    }
    
    // Robust JSON extraction
    let jsonString = rawText;
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = rawText.substring(firstBrace, lastBrace + 1);
    }
    
    return NextResponse.json({ opportunity: JSON.parse(jsonString) });

  } catch (error: any) {
    console.error('Parser Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse data' },
      { status: 500 }
    );
  }
}
