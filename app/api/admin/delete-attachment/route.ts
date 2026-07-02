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

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { opportunityId, publicId } = body;

  if (!opportunityId || !publicId) {
    return NextResponse.json({ error: 'Missing opportunityId or publicId' }, { status: 400 });
  }

  try {
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, 'raw');
    // Also try image type in case it was uploaded as image
    await deleteFromCloudinary(publicId, 'image');

    // Remove from DB
    const service = createServiceClient();
    const { data: opp } = await service
      .from('opportunities')
      .select('attachments_json')
      .eq('id', opportunityId)
      .single();

    const existing = (opp?.attachments_json as any[]) || [];
    const filtered = existing.filter((att: any) => att.public_id !== publicId);

    const { error } = await service
      .from('opportunities')
      .update({ attachments_json: filtered })
      .eq('id', opportunityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
