import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusopportunityhub.in';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  // Dynamic opportunity pages
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('opportunities')
      .select('id, updated_at, type')
      .eq('is_published', true)
      .eq('is_expired', false)
      .order('updated_at', { ascending: false })
      .limit(1000);

    const dynamicPages: MetadataRoute.Sitemap = (data || []).map((opp: any) => ({
      url: `${baseUrl}/opportunities/${opp.id}`,
      lastModified: new Date(opp.updated_at),
      changeFrequency: 'daily' as const,
      priority: opp.type === 'placement' || opp.type === 'internship' ? 0.8 : 0.7,
    }));

    return [...staticPages, ...dynamicPages];
  } catch {
    return staticPages;
  }
}

