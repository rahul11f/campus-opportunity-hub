'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthHashRedirector() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    const hasAccessToken = hash && hash.includes('access_token=');
    const isRecovery = hash && hash.includes('type=recovery');
    const isMagicLink = hash && (hash.includes('type=magiclink') || hash.includes('type=signup'));

    if (hasAccessToken) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
          if (isRecovery || event === 'PASSWORD_RECOVERY') {
            router.replace('/update-password');
          } else if (isMagicLink) {
            router.replace('/dashboard');
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router, supabase]);

  return null;
}
