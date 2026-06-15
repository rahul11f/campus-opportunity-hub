import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const url = new URL(req.url);
  const redirectUrl = url.searchParams.get('redirect') || '/';

  return NextResponse.redirect(new URL(redirectUrl, req.url), {
    status: 302,
  });
}

export async function GET(req: Request) {
  return POST(req);
}
