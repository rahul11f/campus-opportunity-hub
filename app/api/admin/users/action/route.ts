import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabaseUser = createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '').split(',').map(e => e.trim()).filter(Boolean);
    if (!user.email || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, userId } = await req.json();

    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing action or userId' }, { status: 400 });
    }

    const supabaseAdmin = createServiceClient();

    if (action === 'delete') {
      // 1. Delete user from Supabase Auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // 2. Delete user profile (cascades or manual depending on foreign keys)
      await supabaseAdmin.from('student_profiles').delete().eq('user_id', userId);

      return NextResponse.json({ success: true, message: 'User deleted' });
    } 
    
    if (action === 'ban' || action === 'unban') {
      // Banning a user prevents them from logging in
      // We set ban_duration to a large value for ban, and 'none' for unban
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: action === 'ban' ? '87600h' : 'none'
      });
      if (authError) throw authError;

      return NextResponse.json({ success: true, message: `User ${action}ned` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin User Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
