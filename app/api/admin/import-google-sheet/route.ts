import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getFeatureFlags } from '@/lib/settings';
import { logUsage } from '@/lib/usage';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email || '');
}

function extractSheetCsvUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes('docs.google.com')) {
      return null;
    }

    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

    if (!match) {
      return null;
    }

    const sheetId = match[1];

    let gid = '0';

    const gidMatch = url.match(/[?&]gid=(\d+)/);

    if (gidMatch) {
      gid = gidMatch[1];
    }

    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  } catch {
    return null;
  }
}

function findValue(row: Record<string, string>, aliases: string[]) {
  const keys = Object.keys(row);

  for (const alias of aliases) {
    const match = keys.find(
      (k) => k.toLowerCase().trim() === alias.toLowerCase()
    );

    if (match) {
      return row[match];
    }
  }

  return null;
}

function parseCsv(csv: string) {
  const lines = csv
    .split(/\r?\n/)
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',');

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    return row;
  });
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

  const flags = await getFeatureFlags();

  if (!flags.google_sheet_enabled) {
    return NextResponse.json(
      { error: 'Google Sheet import disabled by admin' },
      { status: 403 }
    );
  }

  const body = await request.json();

  const { sheetUrl, opportunityId, collegeId } = body;

  if (!sheetUrl || !opportunityId) {
    return NextResponse.json(
      { error: 'Missing Google Sheet URL or opportunity' },
      { status: 400 }
    );
  }

  const csvUrl = extractSheetCsvUrl(sheetUrl);

  if (!csvUrl) {
    return NextResponse.json(
      { error: 'Invalid Google Sheet URL' },
      { status: 400 }
    );
  }

  const response = await fetch(csvUrl);

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          'Could not access sheet. Make sure it is shared publicly.',
      },
      { status: 400 }
    );
  }

  const csv = await response.text();

  const rows = parseCsv(csv);

  if (!rows.length) {
    return NextResponse.json(
      { error: 'No rows found in sheet' },
      { status: 400 }
    );
  }

  const records = rows
    .map((r) => ({
      opportunity_id: opportunityId,
      college_id: collegeId || null,
      student_name:
        findValue(r, ['name', 'student name']) || null,
      father_name:
        findValue(r, ['father name', 'father']) || null,
      university_roll_no:
        findValue(r, [
          'roll no',
          'roll number',
          'university roll no',
          'university roll number',
        ]) || null,
      branch:
        findValue(r, ['branch', 'stream']) || null,
      batch:
        findValue(r, ['batch', 'yop']) || null,
      course:
        findValue(r, ['course']) || null,
      backlogs:
        findValue(r, ['backlog', 'backlogs']) || null,
      eligible: true,
      raw_row: r,
    }))
    .filter((r) => r.university_roll_no);

  if (!records.length) {
    return NextResponse.json(
      { error: 'No valid roll numbers found' },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const { error } = await service
    .from('eligibility_candidates')
    .upsert(records, {
      onConflict: 'opportunity_id,university_roll_no',
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await logUsage('google_sheet', 'import', true, { imported: records.length });

  return NextResponse.json({
    success: true,
    imported: records.length,
  });
}



