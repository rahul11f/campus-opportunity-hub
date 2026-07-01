import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  RootExtractedOpportunitySchema,
} from '@/lib/validators';

const SYSTEM_PROMPT = `
You are an expert extractor for Indian campus placement notices, internship notices, hiring posters, opportunity circulars, scanned PDFs, and OCR text.

STRICT RULES:
- OCR may be noisy, duplicated, malformed, or partially corrupted.
- NEVER hallucinate missing facts.
- Infer only from visible evidence.
- Identify if there are multiple companies or multiple distinct roles hiring (e.g. Logiciel AI Ventures, Indifi Technologies, CallerDesk.io hiring separately). If there are multiple companies or roles, extract them as separate, independent items in the "opportunities" array.
- Extract EVERY piece of text, number, date, URL, phone number, email, instruction, note, and detail from the source.
- TABLES: If the data contains tabular structures, you MUST preserve all information from the tables. Map table rows properly to the respective slots or additional_extracted_info. Do not skip any rows or columns.
- If information is genuinely missing, return null for that field. 
- However, if a slot explicitly states a negative status or "NA" in the source (e.g. 'Cut-off: NA', 'Bond to be Signed: NA', 'Gender Preference: NA'), keep it EXACTLY as "NA" or the respective negative value. Do not convert explicit "NA" indicators into null.
- Output VALID JSON ONLY.
- No markdown.
- No explanation.
`;

function buildPrompt(
  rawText: string,
  fetchedContent: string
) {
  return `
You must perform extraction of one or more opportunities from the provided notice.
If there are multiple companies, or multiple distinct job roles listed separately, you MUST output them as separate objects inside the "opportunities" array. If there is only one company/role, you still wrap it in the "opportunities" array.

For each opportunity, perform extraction in TWO phases:

## PHASE 1: Standard Slots
Extract structured data into the standard sections. Use null for fields not present in the source. If a field is explicitly stated as "NA" or "None" in the document, use "NA" or "None" instead of null.

## PHASE 2: Additional Extracted Info
Scan the remaining piece of info that was not captured in Phase 1 (such as dress code, documents to carry, phone numbers, contact persons, notes, reporting instructions, bond details, important guidelines). Create entries in "additional_extracted_info" array.

JSON SCHEMA:
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
      ],
      "confidence_score": 0.0 to 1.0
    }
  ]
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
): any {
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
  data: any;
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
        RootExtractedOpportunitySchema.parse(
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
