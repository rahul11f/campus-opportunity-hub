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
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

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

  const supabase = createServiceClient();

  const { data: contribution } = await supabase
    .from('student_contributions')
    .select('*')
    .eq('id', contributionId)
    .maybeSingle();

  if (!contribution) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  await supabase
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

  await supabase
    .from('student_notifications')
    .insert({
      user_id: contribution.user_id,
      title: 'Contribution Rejected',
      message:
        rejectionReason || 'Rejected by admin',
      type: 'error',
    });

  return NextResponse.json({
    success: true,
  });
}