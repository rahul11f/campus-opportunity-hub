import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email || '');
}

function findValue(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);

  for (const alias of aliases) {
    const match = keys.find(
      (k) => k.toLowerCase().trim() === alias.toLowerCase()
    );

    if (match) return row[match];
  }

  return null;
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

  const formData = await request.formData();

  const file = formData.get('file') as File | null;
  const opportunityId = formData.get('opportunityId') as string | null;
  const collegeId = formData.get('collegeId') as string | null;

  if (!file || !opportunityId) {
    return NextResponse.json(
      { error: 'Missing file/opportunity' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet);

  if (!rows.length) {
    return NextResponse.json(
      { error: 'No rows found' },
      { status: 400 }
    );
  }

  const records = rows.map((row) => {
    const r = row as Record<string, unknown>;

    return {
      opportunity_id: opportunityId,
      college_id: collegeId || null,
      student_name:
        findValue(r, ['name', 'student name'])?.toString() || null,
      father_name:
        findValue(r, ['father name', 'father'])?.toString() || null,
      university_roll_no:
        findValue(r, [
          'roll no',
          'roll number',
          'university roll no',
          'university roll number',
        ])?.toString() || null,
      branch:
        findValue(r, ['branch', 'stream'])?.toString() || null,
      batch:
        findValue(r, ['batch', 'yop'])?.toString() || null,
      course:
        findValue(r, ['course'])?.toString() || null,
      backlogs:
        findValue(r, ['backlog', 'backlogs'])?.toString() || null,
      eligible: true,
      raw_row: r,
    };
  });

  const service = createServiceClient();

  const { error } = await service
    .from('eligibility_candidates')
    .insert(records);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    imported: records.length,
  });
}
