import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { OpportunityCreateSchema } from '@/lib/validators';
import { z } from 'zod';

const PartialOpportunitySchema = OpportunityCreateSchema.partial();
const IdSchema = z.string().uuid();

async function getAuthenticatedAdmin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.length > 0 && !adminEmails.includes(user.email || '')) {
    return null;
  }

  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const parsedId = IdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid opportunity id' },
      { status: 400 }
    );
  }

  const admin = await getAuthenticatedAdmin();
  const supabase = createClient();

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('id', parsedId.data);
  if (!admin) {
    query = query
      .eq('is_published', true)
      .eq('is_expired', false);
  }

  const { data } = await query.single();

  if (!data) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const parsedId = IdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid opportunity id' },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = PartialOpportunitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from('opportunities')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsedId.data)
    .select()
    .single();

  if (!data) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }

  await serviceClient.from('admin_logs').insert({
    admin_id: admin.id,
    action: `Updated opportunity: ${parsedId.data}`,
    opportunity_id: parsedId.data,
    metadata: parsed.data,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const parsedId = IdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid opportunity id' },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();

  const { data: existing } = await serviceClient
    .from('opportunities')
    .select('role, company')
    .eq('id', parsedId.data)
    .single();

  await serviceClient
    .from('opportunities')
    .delete()
    .eq('id', parsedId.data);

  await serviceClient.from('admin_logs').insert({
    admin_id: admin.id,
    action: `Deleted opportunity: ${existing?.role || 'unknown'} at ${existing?.company || 'unknown'}`,
    opportunity_id: parsedId.data,
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
