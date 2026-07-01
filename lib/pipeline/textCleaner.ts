type CleanOptions = {
  maxChars?: number;
  preserveLineBreaks?: boolean;
};

type CleanResult = {
  cleaned: string;
  stats: {
    originalLength: number;
    cleanedLength: number;
    reductionPercent: number;
  };
};

const NOISE_PATTERNS = [
  /join\s+our\s+telegram/gi,
  /follow\s+us\s+on/gi,
  /subscribe\s+now/gi,
  /click\s+here/gi,
  /download\s+app/gi,
  /share\s+this/gi,
  /privacy\s+policy/gi,
  /terms\s+of\s+service/gi,
  /cookie\s+policy/gi,
  /all\s+rights\s+reserved/gi,
  /advertisement/gi,
];

const URL_PATTERN = /https?:\/\/[^\s]+/gi;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function normalizeOCRArtifacts(text: string): string {
  return text
    .replace(/\bApp\|y\b/gi, "Apply")
    .replace(/\b0pp/gi, "Opp")
    .replace(/\bN0W\b/gi, "NOW")
    .replace(/\b1ntern\b/gi, "Intern");
}

function dedupeParagraphs(text: string): string {
  const seen = new Set<string>();

  return text
    .split(/\n{2,}/)
    .filter((block) => {
      const normalized = block.trim().toLowerCase();
      if (!normalized) return false;
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .join("\n\n");
}

function removeNoise(text: string): string {
  let cleaned = text;

  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned.replace(URL_PATTERN, "");

  return cleaned;
}

function smartTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  const lastSentence = truncated.lastIndexOf(".");

  if (lastSentence > maxChars * 0.7) {
    return truncated.slice(0, lastSentence + 1);
  }

  const lastBreak = truncated.lastIndexOf("\n");
  if (lastBreak > maxChars * 0.7) {
    return truncated.slice(0, lastBreak);
  }

  return truncated;
}

export function cleanText(
  text: string,
  options: CleanOptions = {}
): CleanResult {
  const originalLength = text.length;
  let cleaned = text;

  cleaned = cleaned.normalize("NFC");
  cleaned = decodeEntities(cleaned);

  cleaned = cleaned.replace(/<[^>]*>/g, " ");
  cleaned = cleaned.replace(/[=\-*#~]{3,}/g, "\n");

  cleaned = normalizeOCRArtifacts(cleaned);

  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  cleaned = removeNoise(cleaned);

  cleaned = cleaned.replace(
    /^(forwarded from|forwarded message|from:|fw:|fwd:).*/gim,
    ""
  );

  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  cleaned = dedupeParagraphs(cleaned);

  const maxChars = options.maxChars ?? 18000;
  cleaned = smartTruncate(cleaned, maxChars);

  const cleanedLength = cleaned.length;

  return {
    cleaned,
    stats: {
      originalLength,
      cleanedLength,
      reductionPercent:
        originalLength > 0
          ? Math.round(
              ((originalLength - cleanedLength) / originalLength) * 100
            )
          : 0,
    },
  };
}

export function truncateText(text: string, maxChars = 18000): string {
  return smartTruncate(text, maxChars);
}

export function extractMainContent(html: string): string {
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "");

  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<\/th>/gi, " | ");

  return cleanText(cleaned).cleaned;
}