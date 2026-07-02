import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email || '');
}

// GET: Preview expired opportunities pending cleanup
export async function GET() {
  const service = createServiceClient();

  // Find opportunities where deadline + retention_days < now
  // We can query using JS since raw interval math in JS is very precise
  const { data: opps, error } = await service
    .from('opportunities')
    .select('id, company, role, deadline, retention_days, attachments_json')
    .or('is_expired.eq.true,deadline.lt.now()')
    .not('deadline', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const pending = (opps || []).filter((opp: any) => {
    const deadlineDate = new Date(opp.deadline);
    const retentionDays = opp.retention_days || 30;
    const expiryThreshold = new Date(deadlineDate.getTime() + retentionDays * 24 * 60 * 60 * 1000);
    return expiryThreshold < now;
  });

  return NextResponse.json({
    count: pending.length,
    opportunities: pending,
  });
}

// POST: Run cleanup (delete Cloudinary files and Supabase rows)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();

  // 1. Fetch pending opportunities
  const { data: opps, error: fetchError } = await service
    .from('opportunities')
    .select('id, company, role, deadline, retention_days, attachments_json')
    .or('is_expired.eq.true,deadline.lt.now()')
    .not('deadline', 'is', null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const now = new Date();
  const pending = (opps || []).filter((opp: any) => {
    const deadlineDate = new Date(opp.deadline);
    const retentionDays = opp.retention_days || 30;
    const expiryThreshold = new Date(deadlineDate.getTime() + retentionDays * 24 * 60 * 60 * 1000);
    return expiryThreshold < now;
  });

  if (pending.length === 0) {
    return NextResponse.json({ success: true, message: 'No expired opportunities to clean up', deletedCount: 0 });
  }

  const ids = pending.map((opp: any) => opp.id);
  const deletedAttachmentsCount = { raw: 0, image: 0 };

  // 2. Loop through and delete attachments from Cloudinary
  for (const opp of pending) {
    const attachments = (opp.attachments_json as any[]) || [];
    for (const att of attachments) {
      if (att.public_id) {
        try {
          // Delete raw (PDF, xlsx) and image types
          await deleteFromCloudinary(att.public_id, 'raw');
          await deleteFromCloudinary(att.public_id, 'image');
          deletedAttachmentsCount.raw++;
        } catch (e) {
          console.error(`Failed to delete Cloudinary attachment ${att.public_id}:`, e);
        }
      }
    }
  }

  // 3. Delete from Database
  const { error: deleteError } = await service
    .from('opportunities')
    .delete()
    .in('id', ids);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Successfully cleaned up ${pending.length} opportunities and ${deletedAttachmentsCount.raw} attachments`,
    deletedCount: pending.length,
    deletedAttachmentsCount: deletedAttachmentsCount.raw,
  });
}
