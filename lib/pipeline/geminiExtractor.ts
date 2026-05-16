import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ExtractedOpportunitySchema,
  type ExtractedOpportunityData,
} from '@/lib/validators';

const SYSTEM_PROMPT = `
You are an expert extractor for Indian campus placement notices, internship notices, hiring posters, opportunity circulars, scanned PDFs, and OCR text.

STRICT RULES:
- OCR may be noisy, duplicated, malformed, or partially corrupted.
- NEVER hallucinate missing facts.
- Infer only from visible evidence.
- If uncertain, return null.
- Prefer exact extracted values.
- Output VALID JSON ONLY.
- No markdown.
- No explanation.
`;

function buildPrompt(
  rawText: string,
  fetchedContent: string
) {
  return `
Extract structured opportunity data.

IMPORTANT EXTRACTION TARGETS:

COMPANY:
- recruiter/company name
- normalize obvious OCR corruption

ROLE:
- exact job role / internship title

TYPE:
Must be one of:
placement
internship
hackathon
scholarship
campus_drive
fellowship
competition
other

SALARY:
Extract:
- CTC
- stipend
- compensation
- package

LOCATION:
City / work location if visible

ELIGIBILITY:
Extract:
- branches
- CGPA
- backlog rules
- eligible batch
- other criteria

INTERVIEW:
Extract:
- rounds count
- round names

LINKS:
Extract actual apply link if visible

DATES:
Extract exact deadline if visible

SKILLS:
Extract technologies / required skills

INSTRUCTIONS:
Summarize actionable instructions only

CONFIDENCE:
0.0 to 1.0
Higher only if evidence is strong.

RAW NOTICE:
${rawText}

${
  fetchedContent
    ? `FETCHED CONTENT:\n${fetchedContent}`
    : ''
}

RETURN EXACT JSON:

{
  "company": string | null,
  "role": string | null,
  "type": "placement"|"internship"|"hackathon"|"scholarship"|"campus_drive"|"fellowship"|"competition"|"other"|null,
  "salary": string | null,
  "location": string | null,
  "eligibility": {
    "branches": string[] | null,
    "cgpa": string | null,
    "backlog": string | null,
    "batch": string | null,
    "other": string | null
  } | null,
  "skills": string[] | null,
  "responsibilities": string[] | null,
  "interview_process": {
    "rounds": number | null,
    "description": string[] | null
  } | null,
  "instructions": string | null,
  "apply_link": string | null,
  "deadline": string | null,
  "tags": string[] | null,
  "confidence_score": number
}
`;
}

function parseJsonResponse(
  text: string
): unknown {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('No JSON object found');
  }

  cleaned = cleaned.slice(start, end + 1);

  return JSON.parse(cleaned);
}

export async function extractWithGemini(
  rawText: string,
  fetchedContent = ''
): Promise<{
  data: ExtractedOpportunityData;
  raw: string;
  retried: boolean;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not configured'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  const prompt = buildPrompt(
    rawText,
    fetchedContent
  );

  let lastError: unknown = null;
  let rawResponse = '';

  for (let i = 0; i < models.length; i++) {
    try {
      const model =
        genAI.getGenerativeModel({
          model: models[i],
          systemInstruction:
            SYSTEM_PROMPT,
        });

      const result =
        await model.generateContent(
          prompt
        );

      rawResponse =
        result.response.text();

      const parsed =
        parseJsonResponse(rawResponse);

      const validated =
        ExtractedOpportunitySchema.parse(
          parsed
        );

      return {
        data: validated,
        raw: rawResponse,
        retried: i > 0,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Gemini extraction failed: ${
      lastError instanceof Error
        ? lastError.message
        : 'Unknown error'
    }`
  );
}
