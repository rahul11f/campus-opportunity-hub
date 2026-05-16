import { createServiceClient } from '@/lib/supabase/server';

export async function logUsage(
  service: string,
  action: string,
  success = true,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createServiceClient();

  await supabase.from('api_usage_logs').insert({
    service,
    action,
    success,
    metadata,
  });
}

export async function getTodayUsageCount(service: string) {
  const supabase = createServiceClient();

  const today = new Date().toISOString().split('T')[0];

  const { count } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('service', service)
    .gte('created_at', `${today}T00:00:00`);

  return count || 0;
}
