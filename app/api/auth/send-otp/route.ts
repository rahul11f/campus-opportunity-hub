import { NextResponse, NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Spam Protection: 3 requests per minute per IP
    const rateLimit = await checkRateLimit(req, 'auth-otp');
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute before trying again.' }, { status: 429 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // We use service role key if available so it's not subject to anon rate limits natively
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        shouldCreateUser: true // allow new users to login via OTP
      }
    });

    if (error) {
      console.error('Supabase OTP Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('API OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
