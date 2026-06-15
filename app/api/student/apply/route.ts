import { NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';
import { z } from 'zod';

const BodySchema = z.object({
  opportunityId: z.string().uuid(),
});

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

  let body;

  try {
    body = BodySchema.parse(
      await req.json()
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: opportunity } =
    await supabase
      .from('opportunities')
      .select('id')
      .eq('id', body.opportunityId)
      .eq('is_published', true)
      .eq('is_expired', false)
      .maybeSingle();

  if (!opportunity) {
    return NextResponse.json(
      { error: 'Opportunity not found' },
      { status: 404 }
    );
  }

  const { data: existingApp } = await supabase
    .from('student_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('opportunity_id', body.opportunityId)
    .maybeSingle();

  let error = null;
  if (existingApp) {
    const { error: updateError } = await supabase
      .from('student_applications')
      .update({ status: 'applied', updated_at: new Date().toISOString() })
      .eq('id', existingApp.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('student_applications')
      .insert({
        user_id: user.id,
        opportunity_id: body.opportunityId,
        status: 'applied',
      });
    error = insertError;
  }

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}