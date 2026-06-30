import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

function isAdmin(email?: string | null) {
  return (process.env.ADMIN_EMAIL_WHITELIST || process.env.NEXT_PUBLIC_ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .includes(email || '');
}

export async function GET() {
  const service = createServiceClient();
  const { data } = await service
    .from('app_settings')
    .select('*')
    .eq('key', 'ads_campaigns')
    .maybeSingle();

  return NextResponse.json({ ads: data?.value || [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, image_url, link } = await req.json();
    if (!title || !image_url || !link) {
      return NextResponse.json({ error: 'Title, image URL, and link are required' }, { status: 400 });
    }

    const service = createServiceClient();
    
    // Get existing ads
    const { data: existingData } = await service
      .from('app_settings')
      .select('value')
      .eq('key', 'ads_campaigns')
      .maybeSingle();

    const ads = existingData?.value || [];
    
    // Generate new ad
    const crypto = require('crypto');
    const newAd = {
      id: crypto.randomUUID(),
      title,
      image_url,
      link,
      status: 'active',
      views: 0,
      clicks: 0,
      created_at: new Date().toISOString()
    };

    // Upsert back to app_settings
    await service.from('app_settings').upsert({
      key: 'ads_campaigns',
      value: [newAd, ...ads],
    });

    return NextResponse.json({ success: true, ad: newAd });
  } catch (error: any) {
    console.error('Create Ad Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });

    const service = createServiceClient();
    
    // Get existing ads
    const { data: existingData } = await service
      .from('app_settings')
      .select('value')
      .eq('key', 'ads_campaigns')
      .maybeSingle();

    if (!existingData?.value) return NextResponse.json({ success: true });
    
    const newAdsList = existingData.value.filter((ad: any) => ad.id !== id);

    // Upsert back
    await service.from('app_settings').upsert({
      key: 'ads_campaigns',
      value: newAdsList,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Ad Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
