import { NextResponse, NextRequest } from 'next/server';
import { getRedis } from '@/lib/redis';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
    }

    // Look up the recovery token in Redis
    const email = await redis.get(`recovery:${token}`);
    if (!email) {
      return NextResponse.json({ error: 'Recovery token has expired or is invalid' }, { status: 400 });
    }

    // Token is valid. Delete it to prevent reuse.
    await redis.del(`recovery:${token}`);

    // Use Admin SDK to find user and update their password
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
    }

    const user = userList.users.find(u => u.email === String(email));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's password directly via Admin SDK
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Determine redirect destination
    const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || process.env.NEXT_PUBLIC_ADMIN_EMAIL_WHITELIST || '')
      .split(',').map(e => e.trim()).filter(Boolean);
    const isAdmin = adminEmails.includes(String(email));

    return NextResponse.json({
      success: true,
      email: String(email),
      redirectTo: isAdmin ? '/admin/dashboard' : '/login',
    });

  } catch (error: any) {
    console.error('API Reset Password Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
