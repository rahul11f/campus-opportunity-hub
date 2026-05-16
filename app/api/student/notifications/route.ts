import { NextResponse } from 'next/server';
import {
  createClient,
  createServiceClient,
} from '@/lib/supabase/server';

export async function GET() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const supabase = createServiceClient();

  const { data } = await supabase
    .from('student_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  return NextResponse.json(data || []);
}