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

  const { data } = await createServiceClient()
    .from('student_contributions')
    .select('*')
    .eq('status', status)
    .order('created_at', {
      ascending: false,
    });

  return NextResponse.json(data || []);
}
