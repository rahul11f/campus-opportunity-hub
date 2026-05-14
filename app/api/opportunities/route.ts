import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { OpportunityCreateSchema, SearchQuerySchema } from '@/lib/validators';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.length === 0) return false;

  return adminEmails.includes(email || '');
}

function sanitizeSearchTerm(term: string) {
  return term.replace(/[,%()]/g, '').trim();
}

export async function GET(request: NextRequest) {
  const rl = await checkRateLimit(request, 'opportunities');

  if (!rl.success) {
    return rateLimitResponse(rl.reset);
  }

  const { searchParams } = new URL(request.url);
  const parsed = SearchQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    );
  }

  const { q, type, sort, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const supabase = createClient();

  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .eq('is_expired', false);

  if (q) {
    const safeQ = sanitizeSearchTerm(q);

    if (safeQ) {
      query = query.or(
        `company.ilike.%${safeQ}%,role.ilike.%${safeQ}%,location.ilike.%${safeQ}%`
      );
    }
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (sort === 'deadline') {
    query = query.order('deadline', {
      ascending: true,
      nullsFirst: false,
    });
  } else if (sort === 'featured') {
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, count } = await query.range(
    offset,
    offset + limit - 1
  );

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
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

  if (!isAdmin(user.email)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
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

  const parsed = OpportunityCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const { data } = await serviceClient
    .from('opportunities')
    .insert({
      ...parsed.data,
      created_by: user.id,
      apply_link: parsed.data.apply_link || null,
      source_link: parsed.data.source_link || null,
    })
    .select()
    .single();

  if (!data) {
    return NextResponse.json(
      { error: 'Create failed' },
      { status: 500 }
    );
  }

  await serviceClient.from('admin_logs').insert({
    admin_id: user.id,
    action: `Created opportunity: ${parsed.data.role} at ${parsed.data.company}`,
    opportunity_id: data.id,
    metadata: {
      type: parsed.data.type,
      is_published: parsed.data.is_published,
    },
  });

  return NextResponse.json(data, { status: 201 });
}

