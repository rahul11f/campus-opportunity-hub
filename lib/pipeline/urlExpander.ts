import { isPrivateIp } from './urlDetector';

const FETCH_TIMEOUT = 8000; // 8 seconds
const MAX_REDIRECTS = 5;

export async function expandUrl(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    if (isPrivateIp(parsed.hostname)) {
      throw new Error('SSRF_BLOCKED: Private IP range');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampusOpportunityHub/1.0; +https://campusopportunityhub.in)',
      },
    });

    clearTimeout(timeout);

    // Validate resolved URL isn't private
    const finalUrl = response.url || url;
    const finalParsed = new URL(finalUrl);
    if (isPrivateIp(finalParsed.hostname)) {
      throw new Error('SSRF_BLOCKED: Resolved to private IP');
    }

    return finalUrl;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SSRF_BLOCKED')) {
      throw error;
    }
    // On failure, return the original URL
    return url;
  }
}

export async function fetchWithSsrfProtection(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const parsed = new URL(url);
  if (isPrivateIp(parsed.hostname)) {
    throw new Error('SSRF protection: Private/internal URL blocked');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampusOpportunityHub/1.0)',
        ...options.headers,
      },
    });

    // Validate final URL after redirects
    if (response.url) {
      const finalParsed = new URL(response.url);
      if (isPrivateIp(finalParsed.hostname)) {
        throw new Error('SSRF protection: Redirect to private IP blocked');
      }
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}
