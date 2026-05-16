import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';

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

  const body = await request.json();

  const {
    title,
    content,
    contributionType,
    sourceLink,
  } = body;

  if (!title || !content || !contributionType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('full_name,email')
    .eq('id', user.id)
    .maybeSingle();

  const { data: studentProfile } = await service
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const contributorName =
    studentProfile?.full_name ||
    profile?.full_name ||
    'Student';

  const contributorEmail =
    profile?.email || user.email;

  const contributorStudentId =
    studentProfile?.university_roll_no || null;

  const { error } = await service
    .from('student_contributions')
    .insert({
      user_id: user.id,
      college_id: studentProfile?.college_id || null,
      contributor_name: contributorName,
      contributor_email: contributorEmail,
      contributor_student_id: contributorStudentId,
      contribution_type: contributionType,
      title,
      content,
      source_link: sourceLink || null,
      status: 'pending',
      points_awarded: 0,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const { data: existing } = await service
    .from('student_points')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await service.from('student_points').insert({
      user_id: user.id,
      total_points: 0,
      approved_contributions: 0,
      opportunities_submitted: 1,
    });
  } else {
    await service
      .from('student_points')
      .update({
        opportunities_submitted:
          (existing.opportunities_submitted || 0) + 1,
      })
      .eq('user_id', user.id);
  }

  return NextResponse.json({
    success: true,
  });
}
