import { DetectedUrl } from '@/types/opportunity';

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

const SHORTENED_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.me', 'ow.ly', 'rb.gy', 'cutt.ly',
  'short.io', 'tiny.cc', 'is.gd', 'buff.ly', 'lnkd.in', 'goo.gl',
  'wa.me', 'linktr.ee', 'smarturl.it',
];

const GOOGLE_DOC_PATTERN = /docs\.google\.com\/(document|spreadsheets|presentation)/;
const GOOGLE_DRIVE_PATTERN = /drive\.google\.com/;
const NOTION_PATTERN = /notion\.so|notion\.site/;
const LINKEDIN_PATTERN = /linkedin\.com/;
const GITHUB_PATTERN = /github\.com/;
const TELEGRAM_PATTERN = /t\.me|telegram\.me/;
const PDF_PATTERN = /\.pdf(\?|$)/i;
const ONEDRIVE_PATTERN = /onedrive\.live\.com|1drv\.ms/;

export type UrlType = DetectedUrl['type'];

export function detectUrls(text: string): DetectedUrl[] {
  const matches = text.match(URL_REGEX) || [];
  const seen = new Set<string>();
  const results: DetectedUrl[] = [];

  for (const url of matches) {
    const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);

    results.push({
      url: cleanUrl,
      originalUrl: cleanUrl,
      resolvedUrl: null,
      type: classifyUrl(cleanUrl),
      status: 'pending',
      content: null,
      error: null,
    });
  }

  return results;
}

export function classifyUrl(url: string): UrlType {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (PDF_PATTERN.test(url)) return 'pdf';
    if (GOOGLE_DOC_PATTERN.test(url)) return 'google_doc';
    if (GOOGLE_DRIVE_PATTERN.test(url) || ONEDRIVE_PATTERN.test(url)) return 'google_drive';
    if (NOTION_PATTERN.test(url)) return 'notion';
    if (LINKEDIN_PATTERN.test(url)) return 'linkedin';
    if (GITHUB_PATTERN.test(url)) return 'github';
    if (TELEGRAM_PATTERN.test(url)) return 'telegram';
    if (SHORTENED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) return 'webpage';

    return 'webpage';
  } catch {
    return 'unknown';
  }
}

export function isShortenedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SHORTENED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export function isPrivateIp(hostname: string): boolean {
  // Block private IPs and cloud metadata endpoints
  const BLOCKED = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,  // AWS metadata
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
    /^0\./,
    /\.local$/i,
    /\.internal$/i,
  ];

  return BLOCKED.some(pattern => pattern.test(hostname));
}
