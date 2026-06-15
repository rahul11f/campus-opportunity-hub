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
- If information is missing, return "Not Mentioned"
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
Extract structured placement opportunity data from the provided notice.

Return JSON in these sections:
1. basic_information
2. eligibility
3. job_details
4. recruitment_process
5. schedule
6. communication
7. attachments
8. source_metadata

Rules:
- If information is missing, return "Not Mentioned"
- Detect all educational qualifications
- Detect hiring rounds
- Detect dates/times
- Detect online/offline mode
- Extract links
- Normalize repeated values
- Return clean JSON only

JSON SCHEMA:
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
  },
  "confidence_score": 0.0 to 1.0
}

RAW NOTICE:
${rawText}

${
  fetchedContent
    ? `FETCHED CONTENT:\n${fetchedContent}`
    : ''
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
