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

export async function GET(request: NextRequest) {
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

  const status =
    request.nextUrl.searchParams.get('status') ||
    'pending';

  const service = createServiceClient();

  const { data: contributions, error } = await service
    .from('student_contributions')
    .select('*')
    .eq('status', status)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error('Fetch contributions error:', error);
    return NextResponse.json([]);
  }

  const userIds = Array.from(
    new Set((contributions || []).map((c: any) => c.user_id).filter(Boolean))
  );

  const profilesMap: Record<string, { full_name: string; email: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await service
      .from('student_profiles')
      .select('user_id, full_name, email')
      .in('user_id', userIds);

    (profiles || []).forEach((p: any) => {
      profilesMap[p.user_id] = {
        full_name: p.full_name || 'Student',
        email: p.email || '',
      };
    });
  }

  const mapped = (contributions || []).map((item: any) => ({
    ...item,
    contributor_name: profilesMap[item.user_id]?.full_name || 'Student',
    contributor_email: profilesMap[item.user_id]?.email || '',
  }));

  return NextResponse.json(mapped);
}
