import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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

  const service = createServiceClient();

  const { opportunityId } = await request.json();

  if (!opportunityId) {
    return NextResponse.json(
      { error: 'Opportunity ID required' },
      { status: 400 }
    );
  }

  const { data: student } = await service
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!student?.university_roll_no) {
    return NextResponse.json(
      {
        eligible: false,
        reason: 'Complete your student profile first',
      },
      { status: 200 }
    );
  }

  const { data: match } = await service
    .from('eligibility_candidates')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .eq(
      'university_roll_no',
      student.university_roll_no
    )
    .maybeSingle();

  if (!match) {
    return NextResponse.json({
      eligible: false,
      reason:
        'No eligibility list found or your roll number is not listed',
    });
  }

  return NextResponse.json({
    eligible: true,
    candidate: {
      name: match.student_name,
      rollNo: match.university_roll_no,
      branch: match.branch,
      batch: match.batch,
    },
  });
}