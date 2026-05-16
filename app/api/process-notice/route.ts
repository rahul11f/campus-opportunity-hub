import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createClient } from '@/lib/supabase/server';
import { ProcessNoticeSchema } from '@/lib/validators';
import { detectUrls } from '@/lib/pipeline/urlDetector';
import { expandUrl } from '@/lib/pipeline/urlExpander';
import {
  scrapeWithCheerio,
  scrapeGoogleDoc,
  fetchPdfText,
  expandTelegramUrl,
} from '@/lib/pipeline/webScraper';
import { extractTextFromImageUrl } from '@/lib/pipeline/ocrExtractor';
import { classifyUrl as classifyContent } from '@/lib/pipeline/contentClassifier';
import { cleanText, truncateText } from '@/lib/pipeline/textCleaner';
import { cleanOcrText } from '@/lib/pipeline/ocrTextCleaner';
import { extractWithGemini } from '@/lib/pipeline/geminiExtractor';
import { DetectedUrl } from '@/types/opportunity';

const MAX_URLS = 10;

type FetchResult = {
  content: string;
  loginRequired: boolean;
};

import { fallbackExtract } from '@/lib/pipeline/fallbackExtractor';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email || '');
}

async function fetchUrlContent(
  urlObj: DetectedUrl
): Promise<FetchResult> {
  const resolved = urlObj.resolvedUrl || urlObj.originalUrl;
  const classified = classifyContent(resolved);

  switch (classified) {
    case 'google_doc':
      return {
        content: await scrapeGoogleDoc(resolved),
        loginRequired: false,
      };

    case 'pdf': {
      const pdf = await fetchPdfText(resolved);

      if (pdf.isImageOnly) {
        urlObj.error = 'Image-only PDF (OCR needed)';
        return {
          content: '',
          loginRequired: false,
        };
      }

      return {
        content: pdf.text,
        loginRequired: false,
      };
    }

    case 'telegram':
      return {
        content: await expandTelegramUrl(resolved),
        loginRequired: false,
      };

    case 'linkedin':
    case 'google_drive':
      urlObj.error = 'External login required';

      return {
        content: '',
        loginRequired: true,
      };

    case 'image': {
      const ocr = await extractTextFromImageUrl(resolved);

      urlObj.error =
        ocr.confidence < 50
          ? `Low OCR confidence (${Math.round(ocr.confidence)}%)`
          : null;

      return {
        content: ocr.text,
        loginRequired: false,
      };
    }

    case 'plain_text': {
      const response = await fetch(resolved);

      if (!response.ok) {
        throw new Error('Plain text fetch failed');
      }

      return {
        content: await response.text(),
        loginRequired: false,
      };
    }

    case 'html':
    case 'unknown':
    default: {
      const result = await scrapeWithCheerio(resolved);

      if (result.isJsRendered) {
        urlObj.error = 'Dynamic JS-rendered content';
      }

      return {
        content: result.text,
        loginRequired: false,
      };
    }
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!isAdmin(user.email)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  const rl = await checkRateLimit(request, 'process-notice');

  if (!rl.success) {
    return rateLimitResponse(rl.reset);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = ProcessNoticeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 422 }
    );
  }

  const { rawText } = parsed.data;

  const ocrPreparedText = cleanOcrText(rawText);
  const cleanedRawResult = cleanText(ocrPreparedText);
  const cleanedRawText = cleanedRawResult.cleaned;

  const detectedUrls: DetectedUrl[] = detectUrls(rawText);

  if (detectedUrls.length > MAX_URLS) {
    return NextResponse.json(
      { error: 'Too many URLs in notice' },
      { status: 422 }
    );
  }

  const fetchedContents: string[] = [];

  for (const urlObj of detectedUrls) {
    urlObj.status = 'fetching';

    try {
      urlObj.resolvedUrl = await expandUrl(urlObj.originalUrl);

      const result = await fetchUrlContent(urlObj);

      if (result.loginRequired) {
        urlObj.status = 'login_required';
        continue;
      }

      if (result.content) {
        const cleaned = cleanText(result.content).cleaned;

        urlObj.content = truncateText(cleaned, 3000);
        urlObj.status = 'fetched';

        fetchedContents.push(
          `[SOURCE: ${urlObj.resolvedUrl}]\n${cleaned}`
        );
      } else {
        urlObj.status = 'error';
        urlObj.error =
          urlObj.error || 'No extractable content';
      }
    } catch (err) {
      urlObj.status = 'error';
      urlObj.error =
        err instanceof Error
          ? err.message
          : 'Fetch failed';
    }
  }

  const combinedFetchedContent = fetchedContents.join(
    '\n\n====================\n\n'
  );

  let extracted = null;
  let extractionError = null;

  const sourceLink =
    detectedUrls.find((u) => u.resolvedUrl)?.resolvedUrl ||
    detectedUrls.find((u) => u.originalUrl)?.originalUrl ||
    null;

  try {
    const result = await extractWithGemini(
      truncateText(cleanedRawText, 8000),
      truncateText(combinedFetchedContent, 10000)
    );

    extracted = result.data;
  } catch (err) {
    extractionError =
      err instanceof Error
        ? err.message
        : 'AI extraction failed';

    extracted = fallbackExtract(
      cleanedRawText,
      sourceLink
    );
  }

  return NextResponse.json({
    success: true,
    detectedUrls: detectedUrls.map((u) => ({
      ...u,
      content: null,
    })),
    extracted,
    extractionError,
    cleanedText:
      cleanedRawText.substring(0, 500) +
      (cleanedRawText.length > 500 ? '...' : ''),
    diagnostics: {
      urlCount: detectedUrls.length,
      fetchedCount: detectedUrls.filter(
        (u) => u.status === 'fetched'
      ).length,
      loginRequiredCount: detectedUrls.filter(
        (u) => u.status === 'login_required'
      ).length,
      errorCount: detectedUrls.filter(
        (u) => u.status === 'error'
      ).length,
      rawReductionPercent:
        cleanedRawResult.stats.reductionPercent,
    },
  });
}

