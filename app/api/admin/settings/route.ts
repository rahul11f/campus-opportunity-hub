import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';

function isAdmin(email?: string | null) {
  return (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .includes(email || '');
}

export async function GET() {
  const service = createServiceClient();

  const { data } = await service
    .from('app_settings')
    .select('*')
    .eq('key', 'feature_flags')
    .maybeSingle();

  return NextResponse.json(
    data?.value || {}
  );
}

export async function POST(
  request: NextRequest
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  const body = await request.json();

  await createServiceClient()
    .from('app_settings')
    .upsert({
      key: 'feature_flags',
      value: body,
    });

  return NextResponse.json({
    success: true,
  });
}
