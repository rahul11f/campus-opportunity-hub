import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handleSignout(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const redirectTo = request.nextUrl.searchParams.get('redirect') || '/login';

  return NextResponse.redirect(new URL(redirectTo, request.url));
}

export async function POST(request: NextRequest) {
  return handleSignout(request);
}

export async function GET(request: NextRequest) {
  return handleSignout(request);
}
