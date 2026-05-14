import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { scrapeWithCheerio } from '@/lib/pipeline/webScraper';
import { z } from 'zod';

const ScrapeSchema = z.object({
  url: z.string().url(),
});

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.length === 0) return false;

  return adminEmails.includes(email || '');
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

  const parsed = ScrapeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid URL' },
      { status: 400 }
    );
  }

  try {
    const { text, title } = await scrapeWithCheerio(parsed.data.url);

    return NextResponse.json({
      text,
      title,
    });
  } catch {
    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    );
  }
}

