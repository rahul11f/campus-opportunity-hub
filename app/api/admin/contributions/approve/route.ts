import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';

const REWARD_POINTS = 25;

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
    title,
    content,
    contributionType,
  } = await request.json();

  const service = createServiceClient();

  const { data: contribution } = await service
    .from('student_contributions')
    .select('*')
    .eq('id', contributionId)
    .maybeSingle();

  if (!contribution || contribution.status !== 'pending') {
    return NextResponse.json(
      { error: 'Already processed or not found' },
      { status: 400 }
    );
  }

  const { data: opportunity, error } =
    await service
      .from('opportunities')
      .insert({
        company:
          contribution.contributor_name ||
          'Student Contribution',
        role: title || contribution.title,
        type:
          contributionType ||
          contribution.contribution_type ||
          'other',
        instructions:
          content || contribution.content,
        raw_text:
          content || contribution.content,
        source_link: contribution.source_link,
        is_published: true,
        source_type: 'student',
        contribution_id: contribution.id,
        contributor_name:
          contribution.contributor_name,
        contributor_email:
          contribution.contributor_email,
        contributor_student_id:
          contribution.contributor_student_id,
        verified_by_admin: true,
      })
      .select()
      .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await service
    .from('student_contributions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      points_awarded: REWARD_POINTS,
      published_opportunity_id: opportunity.id,
      title: title || contribution.title,
      content: content || contribution.content,
      contribution_type:
        contributionType ||
        contribution.contribution_type,
    })
    .eq('id', contribution.id);

  const { data: points } = await service
    .from('student_points')
    .select('*')
    .eq('user_id', contribution.user_id)
    .maybeSingle();

  if (points) {
    await service
      .from('student_points')
      .update({
        total_points:
          (points.total_points || 0) + REWARD_POINTS,
        approved_contributions:
          (points.approved_contributions || 0) + 1,
      })
      .eq('user_id', contribution.user_id);
  }

  return NextResponse.json({
    success: true,
  });
}
