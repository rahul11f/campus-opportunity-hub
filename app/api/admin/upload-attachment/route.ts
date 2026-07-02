import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const opportunityId = formData.get('opportunityId') as string | null;
  const fileType = (formData.get('fileType') as string) || 'document';

  if (!file || !opportunityId) {
    return NextResponse.json({ error: 'Missing file or opportunityId' }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadToCloudinary(buffer, {
      folder: `campus-hub/attachments/${opportunityId}`,
      resource_type: 'auto',
    });

    const attachment = {
      url: result.url,
      public_id: result.public_id,
      file_type: fileType,
      file_name: file.name,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    };

    // Fetch current attachments
    const service = createServiceClient();
    const { data: opp } = await service
      .from('opportunities')
      .select('attachments_json')
      .eq('id', opportunityId)
      .single();

    const existing = (opp?.attachments_json as any[]) || [];
    existing.push(attachment);

    // Update
    const { error } = await service
      .from('opportunities')
      .update({ attachments_json: existing })
      .eq('id', opportunityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, attachment });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
