import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cleanText, truncateText } from '@/lib/pipeline/textCleaner';
import { extractTextFromImageBuffer } from '@/lib/pipeline/ocrExtractor';
import { parsePdfBuffer } from '@/lib/pipeline/webScraper';
import { extractTextFromScannedPdf } from '@/lib/pipeline/pdfOcr';
import { extractWithGemini } from '@/lib/pipeline/geminiExtractor';
import { fallbackExtract } from '@/lib/pipeline/fallbackExtractor';

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
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email || '');
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
      { error: 'Unsupported file type' },
      { status: 422 }
    );
  }

  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json(
      {
        error: `File too large. Max ${MAX_FILE_MB}MB`,
      },
      { status: 422 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rawText = '';
  let extractionSource = '';

  try {
    if (file.type === 'application/pdf') {
      const pdf = await withTimeout(
        parsePdfBuffer(buffer),
        10000,
        'PDF parse'
      );

      if (pdf.isImageOnly) {
        const scanned = await withTimeout(
          extractTextFromScannedPdf(buffer),
          30000,
          'Scanned PDF OCR'
        );

        rawText = scanned.text;
        extractionSource = 'scanned-pdf-ocr';
      } else {
        rawText = pdf.text;
        extractionSource = 'pdf';
      }
    } else {
      if (DEBUG_BYPASS_OCR) {
        rawText = `
Company: Test Company
Role: Software Engineer
Type: placement
Salary: 8 LPA
Location: Bangalore
CGPA: 6+
Batch: 2026
Instructions: Test upload pipeline
        `;
        extractionSource = 'debug-bypass';
      } else {
        const ocr = await withTimeout(
          extractTextFromImageBuffer(buffer),
          30000,
          'Image OCR'
        );

        rawText = ocr.text;
        extractionSource = 'ocr-image';
      }
    }

    const cleaned = cleanText(rawText).cleaned;

    if (!cleaned || cleaned.length < 30) {
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
      const aiResult = await withTimeout(
        extractWithGemini(
          truncateText(cleaned, 8000),
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

      extracted = fallbackExtract(
        cleaned,
        null
      );
    }

    return NextResponse.json({
      success: true,
      source: extractionSource,
      extracted,
      extractionError,
      cleanedText: truncateText(
        cleaned,
        1000
      ),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Upload processing failed',
      },
      { status: 500 }
    );
  }
}
