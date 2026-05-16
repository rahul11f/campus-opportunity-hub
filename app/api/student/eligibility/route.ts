import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { opportunityId } = await req.json();

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: opp } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .maybeSingle();

  if (!profile || !opp) {
    return NextResponse.json({
      eligible: false,
      reasons: ['Missing student profile or opportunity'],
    });
  }

  const reasons = [];
  let eligible = true;

  const requiredCgpa =
    opp?.eligibility?.cgpa || null;

  const requiredBatch =
    opp?.eligibility?.batch || null;

  const branches =
    opp?.eligibility?.branches || [];

  if (
    requiredCgpa &&
    Number(profile.cgpa || 0) <
      Number(requiredCgpa)
  ) {
    eligible = false;
    reasons.push(
      `Required CGPA: ${requiredCgpa}`
    );
  }

  if (
    requiredBatch &&
    String(profile.batch || '') !==
      String(requiredBatch)
  ) {
    eligible = false;
    reasons.push(
      `Required batch: ${requiredBatch}`
    );
  }

  if (
    branches.length &&
    !branches.some((b: string) =>
      String(profile.branch || '')
        .toLowerCase()
        .includes(b.toLowerCase())
    )
  ) {
    eligible = false;
    reasons.push(
      'Branch mismatch'
    );
  }

  return NextResponse.json({
    eligible,
    reasons,
    profile: {
      branch: profile.branch,
      batch: profile.batch,
      cgpa: profile.cgpa,
    },
  });
}