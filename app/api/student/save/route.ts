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

  await supabase
    .from('student_saved_opportunities')
    .upsert({
      user_id: user.id,
      opportunity_id: opportunityId,
    });

  return NextResponse.json({
    success: true,
  });
}