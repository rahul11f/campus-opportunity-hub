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

export async function POST(request: NextRequest) {
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

  const {
    contributionId,
    rejectionReason,
  } = await request.json();

  const service = createServiceClient();

  await service
    .from('student_contributions')
    .update({
      status: 'rejected',
      rejection_reason:
        rejectionReason || 'Rejected by admin',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', contributionId)
    .eq('status', 'pending');

  return NextResponse.json({
    success: true,
  });
}
