import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';

function validUrl(url?: string) {
  if (!url) return true;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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

  const {
    title,
    content,
    contributionType,
    sourceLink,
  } = await request.json();

  if (
    !title ||
    title.trim().length < 5 ||
    title.trim().length > 200
  ) {
    return NextResponse.json(
      { error: 'Invalid title' },
      { status: 400 }
    );
  }

  if (
    !content ||
    content.trim().length < 30
  ) {
    return NextResponse.json(
      { error: 'Content too short' },
      { status: 400 }
    );
  }

  if (!contributionType) {
    return NextResponse.json(
      { error: 'Contribution type required' },
      { status: 400 }
    );
  }

  if (!validUrl(sourceLink)) {
    return NextResponse.json(
      { error: 'Invalid source link' },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const tenMinutesAgo = new Date(
    Date.now() - 10 * 60 * 1000
  ).toISOString();

  const { data: recentSpam } = await service
    .from('student_contributions')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', tenMinutesAgo)
    .limit(3);

  if ((recentSpam || []).length >= 3) {
    return NextResponse.json(
      {
        error:
          'Too many submissions. Try again later.',
      },
      { status: 429 }
    );
  }

  const { data: duplicate } = await service
    .from('student_contributions')
    .select('id')
    .eq('user_id', user.id)
    .eq('title', title.trim())
    .eq('status', 'pending')
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json(
      {
        error:
          'Similar contribution already pending review.',
      },
      { status: 409 }
    );
  }

  const { data: profile } = await service
    .from('profiles')
    .select('full_name,email')
    .eq('id', user.id)
    .maybeSingle();

  const { data: studentProfile } =
    await service
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

  const contributorName =
    studentProfile?.full_name ||
    profile?.full_name ||
    'Student';

  const contributorEmail =
    profile?.email || user?.email || '';

  const contributorStudentId =
    studentProfile?.university_roll_no || null;

  const { error } = await service
    .from('student_contributions')
    .insert({
      user_id: user.id,
      college_id:
        studentProfile?.college_id || null,
      contributor_student_id:
        contributorStudentId,
      contribution_type: contributionType,
      title: title.trim(),
      content: content.trim(),
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
    await service
      .from('student_points')
      .insert({
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