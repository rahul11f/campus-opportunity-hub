import type {
  ExtractedOpportunity,
  OpportunityType,
} from '@/types/opportunity';

function unique(arr: string[]) {
  return [...new Set(arr.filter(Boolean))];
}

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function extractMatch(
  text: string,
  patterns: RegExp[]
) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return null;
}

export function fallbackExtract(
  text: string,
  sourceLink: string | null
): Partial<ExtractedOpportunity> {
  const normalized = normalize(text);

  const company =
    extractMatch(normalized, [
      /(?:company|organization|recruiter|employer)[:\s-]+([A-Za-z0-9 &.,()\-]{3,120})/i,
      /\b([A-Z][A-Za-z0-9&.,() \-]{2,80})\s+(?:is hiring|hiring|recruiting|invites applications)/i,
    ]) || 'Manual Review Required';

  const role =
    extractMatch(normalized, [
      /(?:role|position|designation|job title)[:\s-]+([A-Za-z0-9 /(),.\-]{3,120})/i,
      /(?:hiring for|opening for|position for|looking for)\s+([A-Za-z0-9 /(),.\-]{3,120})/i,
    ]) || 'Opportunity Listing';

  const salary =
    extractMatch(normalized, [
      /(?:ctc|salary|stipend|package|compensation)[:\s-]+([^.;]{2,120})/i,
      /(\d+(?:\.\d+)?\s*(?:lpa|lakhs?|lakh|k|per month|\/month))/i,
      /(Rs\.?\s?\d[\d,]*(?:\s*(?:per month|\/month|lpa))?)/i,
    ]);

  const location =
    extractMatch(normalized, [
      /(?:location|job location|work location)[:\s-]+([A-Za-z ,\-]{2,80})/i,
      /(?:based in)\s+([A-Za-z ,\-]{2,80})/i,
    ]);

  const deadline =
    extractMatch(normalized, [
      /(?:deadline|last date|apply by|application deadline)[:\s-]+([^.;]{3,80})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
    ]);

  const cgpa =
    extractMatch(normalized, [
      /(?:cgpa|min(?:imum)? cgpa|minimum cgpa)[:\s-]+([0-9.]+)/i,
      /([0-9.]+)\s*cgpa/i,
    ]);

  const backlog =
    extractMatch(normalized, [
      /(?:backlog|arrears?)[:\s-]+([^.;]{2,60})/i,
      /(no active backlogs?)/i,
      /(backlogs? allowed)/i,
    ]);

  const batch =
    extractMatch(normalized, [
      /(?:batch|eligible batch|passing year)[:\s-]+([0-9,\s\/-]{4,40})/i,
      /(20\d{2}(?:\s*,\s*20\d{2})*)/,
    ]);

  const branchesRaw =
    extractMatch(normalized, [
      /(?:eligible branches|branches|departments|eligibility)[:\s-]+([^.;]{5,250})/i,
    ]) || '';

  const branches = unique(
    branchesRaw
      .split(/,|\/|\band\b/i)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 20)
  );

  const applyLink =
    sourceLink ||
    normalized.match(/https?:\/\/[^\s]+/)?.[0] ||
    null;

  const roundsText =
    extractMatch(normalized, [
      /(?:selection process|interview process)[:\s-]+([^.;]{5,200})/i,
    ]) || '';

  const roundsMatch =
    normalized.match(/([1-9])\s*(?:round|rounds)/i);

  const rounds = roundsMatch
    ? Number(roundsMatch[1])
    : null;

  const interviewDescriptions = unique(
    roundsText
      .split(/,|>|->|\band\b/i)
      .map((x) => x.trim())
      .filter(Boolean)
  );

  const skills = unique(
    (
      extractMatch(normalized, [
        /(?:skills required|required skills|skills)[:\s-]+([^.;]{5,200})/i,
      ]) || ''
    )
      .split(/,|\/|\band\b/i)
      .map((x) => x.trim())
      .filter(Boolean)
  );

  let type: OpportunityType = 'placement';

  if (/intern/i.test(normalized)) {
    type = 'internship';
  } else if (/hackathon/i.test(normalized)) {
    type = 'hackathon';
  } else if (/scholarship/i.test(normalized)) {
    type = 'scholarship';
  } else if (/competition/i.test(normalized)) {
    type = 'competition';
  } else if (/campus drive/i.test(normalized)) {
    type = 'campus_drive';
  } else if (/fellowship/i.test(normalized)) {
    type = 'fellowship';
  }

  return {
    company,
    role,
    type,
    salary,
    location,
    eligibility: {
      branches,
      cgpa,
      backlog,
      batch,
      other: null,
    },
    skills,
    responsibilities: [],
    interview_process: {
      rounds,
      description: interviewDescriptions,
    },
    instructions: normalized.substring(0, 2500),
    apply_link: applyLink,
    deadline,
    tags: unique([
      type,
      ...branches.slice(0, 5),
    ]),
    confidence_score: 0.72,
  };
}
