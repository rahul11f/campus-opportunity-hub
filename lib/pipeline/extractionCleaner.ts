/**
 * Post-extraction cleaner — strips placeholder values like
 * "Not Mentioned", "Not Specified", "N/A", etc. from extracted data.
 * Acts as a safety net even after the AI prompt tells it to use null.
 */

const PLACEHOLDER_VALUES = new Set([
  'not mentioned',
  'not specified',
  'not available',
  'nil',
  'null',
  '-',
  '--',
  '—',
  'not applicable',
  'not provided',
  'not found',
  'unknown',
]);

function isPlaceholder(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || PLACEHOLDER_VALUES.has(trimmed);
  }
  return false;
}

/**
 * Recursively clean an object by removing placeholder values.
 * Returns the cleaned object and whether it has any real data.
 */
function cleanObject(
  obj: Record<string, unknown>
): { cleaned: Record<string, unknown>; hasData: boolean } {
  const cleaned: Record<string, unknown> = {};
  let hasData = false;

  for (const [key, value] of Object.entries(obj)) {
    // Preserve arrays (additional_extracted_info, etc.)
    if (Array.isArray(value)) {
      const filteredArr = value.filter((item) => {
        if (typeof item === 'object' && item !== null) {
          // For AdditionalInfoItem objects, keep if value is real
          if ('value' in item && 'label' in item) {
            return !isPlaceholder((item as Record<string, unknown>).value);
          }
          return true;
        }
        return !isPlaceholder(item);
      });

      if (filteredArr.length > 0) {
        cleaned[key] = filteredArr;
        hasData = true;
      }
      continue;
    }

    // Recurse into nested objects (sections)
    if (typeof value === 'object' && value !== null) {
      const sub = cleanObject(value as Record<string, unknown>);
      if (sub.hasData) {
        cleaned[key] = sub.cleaned;
        hasData = true;
      }
      continue;
    }

    // Preserve numbers (confidence_score, etc.)
    if (typeof value === 'number') {
      cleaned[key] = value;
      hasData = true;
      continue;
    }

    // Clean string values
    if (!isPlaceholder(value)) {
      cleaned[key] = value;
      hasData = true;
    }
  }

  return { cleaned, hasData };
}

export type CleanedExtraction = {
  /** The extraction data with all placeholder values removed */
  data: Record<string, unknown>;
  /** List of section names that have at least one populated field */
  populatedSections: string[];
  /** Total count of real (non-placeholder) fields */
  populatedFieldCount: number;
  /** Total sections scanned */
  totalSections: number;
};

const SECTION_KEYS = [
  'basic_information',
  'eligibility',
  'job_details',
  'recruitment_process',
  'schedule',
  'communication',
  'attachments',
  'source_metadata',
];

export function cleanExtraction(
  rawData: Record<string, unknown>
): any {
  if (Array.isArray(rawData.opportunities)) {
    const cleanedOpportunities = rawData.opportunities.map((opp: any) => {
      const { cleaned } = cleanObject(opp);
      return cleaned;
    });
    
    return {
      data: {
        opportunities: cleanedOpportunities
      },
      populatedSections: ['opportunities'],
      populatedFieldCount: cleanedOpportunities.reduce((acc: number, opp: any) => {
        let count = 0;
        for (const k of SECTION_KEYS) {
          if (opp[k] && typeof opp[k] === 'object') {
            count += Object.keys(opp[k]).length;
          }
        }
        if (Array.isArray(opp.additional_extracted_info)) {
          count += opp.additional_extracted_info.length;
        }
        return acc + count;
      }, 0),
      totalSections: SECTION_KEYS.length + 1
    };
  }

  const { cleaned } = cleanObject(rawData);

  const populatedSections: string[] = [];
  let populatedFieldCount = 0;

  for (const sectionKey of SECTION_KEYS) {
    const section = cleaned[sectionKey];

    if (
      section &&
      typeof section === 'object' &&
      !Array.isArray(section)
    ) {
      const fieldCount = Object.keys(
        section as Record<string, unknown>
      ).length;

      if (fieldCount > 0) {
        populatedSections.push(sectionKey);
        populatedFieldCount += fieldCount;
      }
    }
  }

  // Count additional_extracted_info items
  const additionalInfo = cleaned.additional_extracted_info;
  if (Array.isArray(additionalInfo) && additionalInfo.length > 0) {
    populatedSections.push('additional_extracted_info');
    populatedFieldCount += additionalInfo.length;
  }

  return {
    data: cleaned,
    populatedSections,
    populatedFieldCount,
    totalSections: SECTION_KEYS.length + 1,
  };
}
