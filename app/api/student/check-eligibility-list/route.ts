import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { opportunityId, rollNo, name, branch } = body;

  if (!opportunityId) {
    return NextResponse.json({ error: 'Missing opportunityId' }, { status: 400 });
  }

  if (!rollNo && !name && !branch) {
    return NextResponse.json({ error: 'Provide at least one search field (rollNo, name, or branch)' }, { status: 400 });
  }

  const service = createServiceClient();

  // Build the query
  let query = service
    .from('eligibility_candidates')
    .select('*')
    .eq('opportunity_id', opportunityId);

  // Apply search filters (case-insensitive)
  if (rollNo) {
    query = query.ilike('university_roll_no', `%${rollNo.trim()}%`);
  }

  if (name) {
    query = query.ilike('student_name', `%${name.trim()}%`);
  }

  if (branch) {
    query = query.ilike('branch', `%${branch.trim()}%`);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if there's an eligibility list at all for this opportunity
  const { count } = await service
    .from('eligibility_candidates')
    .select('id', { count: 'exact', head: true })
    .eq('opportunity_id', opportunityId);

  return NextResponse.json({
    found: (data || []).length > 0,
    totalCandidates: count || 0,
    candidates: (data || []).map((c: any) => ({
      student_name: c.student_name,
      father_name: c.father_name,
      university_roll_no: c.university_roll_no,
      course: c.course,
      branch: c.branch,
      batch: c.batch,
      backlogs: c.backlogs,
      eligible: c.eligible,
      raw_row: c.raw_row,
    })),
  });
}
