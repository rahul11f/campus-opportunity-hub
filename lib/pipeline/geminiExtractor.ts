import {
  ExtractedOpportunitySchema,
  type ExtractedOpportunityData,
} from '@/lib/validators';

const SYSTEM_PROMPT = `
You extract structured campus opportunity data from messy Indian recruitment notices.

Rules:
- Extract ONLY factual information present in provided text.
- Never hallucinate.
- Missing or unclear fields must be null.
- Return ONLY valid JSON.
- No markdown.
- No explanation.
`;

function buildPrompt(rawText: string, fetchedContent: string) {
  return `
RAW NOTICE:
${rawText}

${fetchedContent ? `FETCHED CONTENT:\n${fetchedContent}` : ''}

Return EXACT JSON:

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

Rules:
- salary preserve formatting
- deadline ISO if confidently known
- confidence_score must be 0 to 1
`;
}

async function geminiRequest(
  apiKey: string,
  prompt: string,
  strict = false,
  model = 'gemini-1.5-pro'
): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 45000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: strict
                  ? SYSTEM_PROMPT + '\nSTRICT JSON ONLY.'
                  : SYSTEM_PROMPT,
              },
            ],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: strict ? 0 : 0.1,
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API ${response.status}: ${err}`);
    }

    const json = await response.json();

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || typeof text !== 'string') {
      throw new Error('Empty Gemini response');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonResponse(text: string): unknown {
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

function normalizeConfidence(data: ExtractedOpportunityData) {
  if (
    typeof data.confidence_score !== 'number' ||
    Number.isNaN(data.confidence_score)
  ) {
    data.confidence_score = 0.5;
    return;
  }

  if (data.confidence_score < 0) {
    data.confidence_score = 0;
  }

  if (data.confidence_score > 1) {
    data.confidence_score = 1;
  }
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
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = buildPrompt(rawText, fetchedContent);

  const attempts = [
    {
      strict: false,
      model: 'gemini-1.5-pro',
    },
    {
      strict: true,
      model: 'gemini-1.5-pro',
    },
    {
      strict: true,
      model: 'gemini-1.5-flash',
    },
  ];

  let lastError: unknown = null;
  let rawResponse = '';

  for (let i = 0; i < attempts.length; i++) {
    try {
      const attempt = attempts[i];

      rawResponse = await geminiRequest(
        apiKey,
        prompt,
        attempt.strict,
        attempt.model
      );

      const parsed = parseJsonResponse(rawResponse);
      const validated =
        ExtractedOpportunitySchema.parse(parsed);

      normalizeConfidence(validated);

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