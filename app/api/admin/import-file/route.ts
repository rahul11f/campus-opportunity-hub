import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cleanText, truncateText } from '@/lib/pipeline/textCleaner';
import { extractTextFromImageBuffer } from '@/lib/pipeline/ocrExtractor';
import { parsePdfBuffer } from '@/lib/pipeline/webScraper';
import { extractTextFromScannedPdf } from '@/lib/pipeline/pdfOcr';
import { extractWithGemini } from '@/lib/pipeline/geminiExtractor';
import { fallbackExtract } from '@/lib/pipeline/fallbackExtractor';
import {
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/rateLimit';
import {
  getFeatureFlags,
  getUsageLimits,
} from '@/lib/settings';
import {
  getTodayUsageCount,
  logUsage,
} from '@/lib/usage';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const MAX_FILE_MB = 15;
const DEBUG_BYPASS_OCR = false;

function isAdmin(email?: string | null) {
  return (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .includes(email || '');
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(`${label} timeout after ${ms}ms`)
          ),
        ms
      )
    ),
  ]);
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

  const rl = await checkRateLimit(
    request,
    'admin-import-file'
  );

  if (!rl.success) {
    return rateLimitResponse(rl.reset);
  }

  const flags = await getFeatureFlags();

  if (!flags.ocr_enabled) {
    return NextResponse.json(
      { error: 'OCR disabled' },
      { status: 403 }
    );
  }

  const limits = await getUsageLimits();

  const todayUsage =
    await getTodayUsageCount('ocr');

  if (
    todayUsage >= limits.ocr_daily_limit
  ) {
    return NextResponse.json(
      {
        error:
          'Daily OCR quota reached',
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'No file uploaded' },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          'Unsupported file type',
      },
      { status: 422 }
    );
  }

  if (
    file.size >
    MAX_FILE_MB * 1024 * 1024
  ) {
    return NextResponse.json(
      {
        error:
          `File too large. Max ${MAX_FILE_MB}MB`,
      },
      { status: 422 }
    );
  }

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  let rawText = '';
  let extractionSource = '';

  try {
    if (
      file.type ===
      'application/pdf'
    ) {
      const pdf = await withTimeout(
        parsePdfBuffer(buffer),
        10000,
        'PDF parse'
      );

      if (pdf.isImageOnly) {
        const scanned =
          await withTimeout(
            extractTextFromScannedPdf(
              buffer
            ),
            30000,
            'Scanned PDF OCR'
          );

        rawText = scanned.text;
        extractionSource =
          'scanned-pdf-ocr';
      } else {
        rawText = pdf.text;
        extractionSource = 'pdf';
      }
    } else {
      if (DEBUG_BYPASS_OCR) {
        rawText = 'Test OCR';
        extractionSource =
          'debug-bypass';
      } else {
        const ocr =
          await withTimeout(
            extractTextFromImageBuffer(
              buffer
            ),
            30000,
            'Image OCR'
          );

        rawText = ocr.text;
        extractionSource =
          'ocr-image';
      }
    }

    const cleaned =
      cleanText(rawText).cleaned;

    if (
      !cleaned ||
      cleaned.length < 30
    ) {
      return NextResponse.json(
        {
          error:
            'Could not extract meaningful text',
        },
        { status: 422 }
      );
    }

    let extracted = null;
    let extractionError = null;

    try {
      const aiResult =
        await withTimeout(
          extractWithGemini(
            truncateText(
              cleaned,
              8000
            ),
            ''
          ),
          20000,
          'Gemini extraction'
        );

      extracted = aiResult.data;
    } catch (err) {
      extractionError =
        err instanceof Error
          ? err.message
          : 'AI extraction failed';

      extracted =
        fallbackExtract(
          cleaned,
          null
        );
    }

    await logUsage(
      'ocr',
      'import-file',
      true
    );

    return NextResponse.json({
      success: true,
      source: extractionSource,
      extracted,
      extractionError,
      cleanedText:
        truncateText(
          cleaned,
          1000
        ),
    });
  } catch (err) {
    await logUsage(
      'ocr',
      'import-file',
      false
    );

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Upload failed',
      },
      { status: 500 }
    );
  }
}