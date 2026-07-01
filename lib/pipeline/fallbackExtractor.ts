import type {
  OpportunityType,
} from '@/types/opportunity';
import type { ExtractedOpportunityData } from '@/lib/validators';

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

type AdditionalInfo = {
  label: string;
  category: 'instructions' | 'contact' | 'logistics' | 'documents' | 'dates' | 'compensation' | 'eligibility' | 'other';
  value: string;
};

function extractAdditionalInfo(text: string): AdditionalInfo[] {
  const items: AdditionalInfo[] = [];

  // Phone numbers
  const phoneMatches = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/g);
  if (phoneMatches) {
    for (const phone of unique(phoneMatches)) {
      items.push({ label: 'Contact Number', category: 'contact', value: phone });
    }
  }

  // Email addresses
  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatches) {
    for (const email of unique(emailMatches)) {
      items.push({ label: 'Email Address', category: 'contact', value: email });
    }
  }

  // Dress code
  const dressCode = extractMatch(text, [
    /(?:dress code|attire|dress)[:\s-]+([^.;]{3,80})/i,
  ]);
  if (dressCode) {
    items.push({ label: 'Dress Code', category: 'instructions', value: dressCode });
  }

  // Documents to carry
  const documents = extractMatch(text, [
    /(?:documents? to carry|bring|carry along|documents? required)[:\s-]+([^.;]{3,200})/i,
    /(?:carry|bring)\s+(?:your\s+)?(?:original\s+)?([^.;]{3,200})/i,
  ]);
  if (documents) {
    items.push({ label: 'Documents to Carry', category: 'documents', value: documents });
  }

  // Reporting instructions
  const reporting = extractMatch(text, [
    /(?:report(?:ing)?|arrival|reach|arrive)[:\s-]+(?:at|by)?\s*([^.;]{3,100})/i,
  ]);
  if (reporting) {
    items.push({ label: 'Reporting Instructions', category: 'logistics', value: reporting });
  }

  // Contact person / coordinator
  const coordinator = extractMatch(text, [
    /(?:contact person|coordinator|placed? officer|poc|point of contact|faculty coordinator)[:\s-]+([^.;]{3,100})/i,
  ]);
  if (coordinator) {
    items.push({ label: 'Contact Person', category: 'contact', value: coordinator });
  }

  // Bus / transport
  const transport = extractMatch(text, [
    /(?:bus|transport|shuttle|pick.?up)[:\s-]+([^.;]{3,100})/i,
  ]);
  if (transport) {
    items.push({ label: 'Transport Info', category: 'logistics', value: transport });
  }

  // Important notes / instructions
  const importantNote = extractMatch(text, [
    /(?:important|note|notice|attention|mandatory)[:\s-]+([^.;]{5,200})/i,
  ]);
  if (importantNote) {
    items.push({ label: 'Important Note', category: 'instructions', value: importantNote });
  }

  // Bond / service agreement
  const bond = extractMatch(text, [
    /(?:bond|service agreement|service bond)[:\s-]+([^.;]{3,120})/i,
  ]);
  if (bond) {
    items.push({ label: 'Bond / Service Agreement', category: 'other', value: bond });
  }

  return items;
}

export function fallbackExtract(
  text: string,
  sourceLink: string | null
): ExtractedOpportunityData {
  const normalized = normalize(text);

  const company =
    extractMatch(normalized, [
      /(?:company|organization|recruiter|employer)[:\s-]+([A-Za-z0-9 &.,()-]{3,120})/i,
      /\b([A-Z][A-Za-z0-9&.,() -]{2,80})\s+(?:is hiring|hiring|recruiting|invites applications)/i,
    ]) || 'Manual Review Required';

  const role =
    extractMatch(normalized, [
      /(?:role|position|designation|job title)[:\s-]+([A-Za-z0-9 /(),.\\-]{3,120})/i,
      /(?:hiring for|opening for|position for|looking for)\s+([A-Za-z0-9 /(),.\\-]{3,120})/i,
    ]) || 'Opportunity Listing';

  const salary =
    extractMatch(normalized, [
      /(?:ctc|salary|stipend|package|compensation)[:\s-]+([^.;]{2,120})/i,
      /(\d+(?:\.\d+)?\s*(?:lpa|lakhs?|lakh|k|per month|\/month))/i,
      /(Rs\.?\s?\d[\d,]*(?:\s*(?:per month|\/month|lpa))?)/i,
    ]);

  const location =
    extractMatch(normalized, [
      /(?:location|job location|work location)[:\s-]+([A-Za-z ,-]{2,80})/i,
      /(?:based in)\s+([A-Za-z ,-]{2,80})/i,
    ]);

  const deadline =
    extractMatch(normalized, [
      /(?:deadline|last date|apply by|application deadline)[:\s-]+([^.;]{3,80})/i,
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
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
      /(?:batch|eligible batch|passing year)[:\s-]+([0-9,\s/-]{4,40})/i,
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
    ]) || null;

  const roundsMatch =
    normalized.match(/([1-9])\s*(?:round|rounds)/i);

  const rounds = roundsMatch
    ? String(Number(roundsMatch[1]))
    : null;

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

  // Extract additional dynamic info
  const additionalInfo = extractAdditionalInfo(normalized);

  return {
    basic_information: {
      company_name: company,
      company_logo: null,
      opportunity_type: type,
      round_name: null,
      verified_status: null,
      application_deadline: deadline || null,
      jd_link: applyLink || null,
    },
    eligibility: {
      educational_qualification: null,
      eligible_branches: branches.length > 0 ? branches.join(', ') : null,
      eligible_streams: null,
      passing_batch: batch || null,
      minimum_cgpa_percentage: cgpa || null,
      cutoff_criteria: null,
      active_backlogs_allowed: backlog || null,
      gender_eligibility: null,
    },
    job_details: {
      job_role: role || null,
      salary_ctc: salary || null,
      stipend: null,
      location: location || null,
      work_mode: null,
      employment_type: null,
    },
    recruitment_process: {
      hiring_process: roundsText || null,
      number_of_rounds: rounds || null,
      elimination_rounds: null,
    },
    schedule: {
      event_date: null,
      time: null,
      venue: null,
      mode: null,
    },
    communication: {
      communication_channel: null,
      check_inbox: null,
      check_spam_folder: null,
      timing_shared_by: null,
      additional_instructions: null,
    },
    attachments: {
      jd_link: applyLink || null,
      student_eligible_list: null,
      additional_documents: null,
    },
    source_metadata: {
      issued_by: null,
      institution: null,
      reminder_notice: null,
      notice_type: null,
    },
    additional_extracted_info: additionalInfo,
    confidence_score: 0.72,
  };
}
