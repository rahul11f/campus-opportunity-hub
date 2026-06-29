import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  // Supabase URL and keys
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    // 1. Exchange the code for a session using the SSR client
    // We import specifically the server client from ssr to avoid issues
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError || !session) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=SessionError`);
    }

    const user = session.user;
    
    // 2. We use a service client (or authenticated client) to upsert the user's profile
    // This ensures that OAuth users immediately get a profile row and don't encounter RLS issues
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Student';
    const email = user.email || '';

    // Create profile
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      email: email,
      role: 'student'
    }, { onConflict: 'id' });

    // Create student_profile
    await supabase.from('student_profiles').upsert({
      user_id: user.id,
      full_name: fullName,
      email: email,
    }, { onConflict: 'user_id' });

    // 3. Redirect based on role
    const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '').split(',').map(e => e.trim());
    if (adminEmails.includes(email)) {
      return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
    }
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  // Fallback
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
