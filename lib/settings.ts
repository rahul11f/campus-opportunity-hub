import { createServiceClient } from '@/lib/supabase/server';

export async function getAppSetting(key: string) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  return data?.value || null;
}

export async function getFeatureFlags() {
  const value = await getAppSetting('feature_flags');

  return (
    value || {
      gemini_enabled: true,
      ocr_enabled: true,
      scraper_enabled: true,
      google_sheet_enabled: true,
      contributions_enabled: true,
      leaderboard_enabled: true,
      homepage_ads_enabled: true,
      dashboard_ads_enabled: true,
    }
  );
}

export async function getUsageLimits() {
  const value = await getAppSetting('usage_limits');

  return (
    value || {
      gemini_daily_limit: 500,
      ocr_daily_limit: 300,
      scrape_daily_limit: 500,
    }
  );
}
