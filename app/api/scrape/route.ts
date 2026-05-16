import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { scrapeWithCheerio } from '@/lib/pipeline/webScraper';
import { z } from 'zod';
import { getFeatureFlags, getUsageLimits } from '@/lib/settings';
import { getTodayUsageCount, logUsage } from '@/lib/usage';

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

  const flags = await getFeatureFlags();
  const limits = await getUsageLimits();

  if (!flags.scraper_enabled) {
    return NextResponse.json(
      { error: 'Scraper disabled by admin' },
      { status: 403 }
    );
  }

  const todayUsage = await getTodayUsageCount('scraper');

  if (todayUsage >= limits.scrape_daily_limit) {
    return NextResponse.json(
      { error: 'Daily scraper quota reached' },
      { status: 429 }
    );
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

    await logUsage('scraper', 'scrape', true);

    return NextResponse.json({
      text,
      title,
    });
  } catch {
    await logUsage('scraper', 'scrape', false);

    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    );
  }
}
