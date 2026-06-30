import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST() {
  try {
    // 1. Verify admin session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || process.env.NEXT_PUBLIC_ADMIN_EMAIL_WHITELIST || '')
      .split(',').map(e => e.trim()).filter(Boolean);
    
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Perform the reset using service client
    const serviceClient = createServiceClient();
    
    // We update rather than delete so we don't break foreign keys or references, just zero out points.
    // If they have no rows, we don't need to do anything.
    const { error } = await serviceClient
      .from('student_points')
      .update({
        total_points: 0,
        approved_contributions: 0,
        pending_contributions: 0
      })
      .neq('total_points', -1); // dummy condition to match all rows

    if (error) {
      console.error('Reset Leaderboard Error:', error);
      return NextResponse.json({ error: 'Database error while resetting leaderboard' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Reset Leaderboard Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
