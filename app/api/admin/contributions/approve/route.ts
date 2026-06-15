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
    title,
    content,
    contributionType,
  } = await request.json();

  const supabase = createServiceClient();

  const { data: contribution } = await supabase
    .from('student_contributions')
    .select('*')
    .eq('id', contributionId)
    .maybeSingle();

  if (!contribution) {
    return NextResponse.json(
      { error: 'Contribution not found' },
      { status: 404 }
    );
  }

  if (contribution.status !== 'pending') {
    return NextResponse.json(
      { error: 'Already processed' },
      { status: 400 }
    );
  }

  // Fetch profile to get real contributor name & email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,email')
    .eq('id', contribution.user_id)
    .maybeSingle();

  const contributorName = profile?.full_name || 'Student';
  const contributorEmail = profile?.email || '';

  // Extract structured slots if present in markdown content
  let parsedSlots: any = null;
  const contentToSearch = content || contribution.content || '';
  const slotsMatch = contentToSearch.match(/\[SLOTS_JSON_DATA\]([\s\S]*?)\[\/SLOTS_JSON_DATA\]/);
  if (slotsMatch && slotsMatch[1]) {
    try {
      parsedSlots = JSON.parse(slotsMatch[1].trim());
    } catch (e) {
      console.error('Failed to parse contribution slots JSON:', e);
    }
  }

  const deadlineVal = parsedSlots?.basic_information?.application_deadline;
  let isoDeadline = null;
  if (deadlineVal && deadlineVal !== 'Not Mentioned') {
    const parsedDate = new Date(deadlineVal);
    if (!isNaN(parsedDate.getTime())) {
      isoDeadline = parsedDate.toISOString();
    }
  }

  const backlogVal = parsedSlots?.eligibility?.active_backlogs_allowed;
  const branchesVal = parsedSlots?.eligibility?.eligible_branches;
  const cgpaVal = parsedSlots?.eligibility?.minimum_cgpa_percentage;
  const batchVal = parsedSlots?.eligibility?.passing_batch;
  const cutoffVal = parsedSlots?.eligibility?.cutoff_criteria;

  const { data: opportunity, error } =
    await supabase
      .from('opportunities')
      .insert({
        company:
          parsedSlots?.basic_information?.company_name ||
          contributorName ||
          'Student Contribution',
        role: parsedSlots?.job_details?.job_role || title || contribution.title,
        type:
          parsedSlots?.basic_information?.opportunity_type ||
          contributionType ||
          contribution.contribution_type,
        instructions:
          parsedSlots?.communication?.additional_instructions ||
          content ||
          contribution.content,
        raw_text:
          content || contribution.content,
        source_link: parsedSlots?.basic_information?.jd_link || contribution.source_link,
        is_published: true,
        source_type: 'student',
        contribution_id: contribution.id,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        contributor_student_id:
          contribution.contributor_student_id,
        verified_by_admin: true,
        salary: parsedSlots?.job_details?.salary_ctc || null,
        location: parsedSlots?.job_details?.location || null,
        deadline: isoDeadline,
        venue: parsedSlots?.schedule?.venue || null,
        interview_mode: parsedSlots?.schedule?.mode || null,
        gender_eligibility: parsedSlots?.eligibility?.gender_eligibility || null,
        education_qualification: parsedSlots?.eligibility?.educational_qualification || null,
        streams_specialization: parsedSlots?.eligibility?.eligible_streams || null,
        eligibility: {
          branches: branchesVal ? [branchesVal] : [],
          cgpa: cgpaVal || '',
          backlog: backlogVal || '',
          batch: batchVal || '',
          other: cutoffVal || '',
          ...parsedSlots?.eligibility
        },
        interview_process: parsedSlots?.recruitment_process ? {
          rounds: isNaN(Number(parsedSlots.recruitment_process.number_of_rounds)) ? null : Number(parsedSlots.recruitment_process.number_of_rounds),
          description: [parsedSlots.recruitment_process.hiring_process]
        } : null
      })
      .select()
      .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await supabase
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
    .eq('id', contribution.id)
    .eq('status', 'pending');

  const { data: points } = await supabase
    .from('student_points')
    .select('*')
    .eq('user_id', contribution.user_id)
    .maybeSingle();

  if (points) {
    await supabase
      .from('student_points')
      .update({
        total_points:
          (points.total_points || 0) + REWARD_POINTS,
        approved_contributions:
          (points.approved_contributions || 0) + 1,
      })
      .eq('user_id', contribution.user_id);
  } else {
    await supabase
      .from('student_points')
      .insert({
        user_id: contribution.user_id,
        total_points: REWARD_POINTS,
        approved_contributions: 1,
      });
  }

  await supabase
    .from('student_notifications')
    .insert({
      user_id: contribution.user_id,
      title: 'Contribution Approved',
      message:
        'Your contribution was approved and published. You earned 25 points.',
      type: 'success',
    });

  return NextResponse.json({
    success: true,
  });
}