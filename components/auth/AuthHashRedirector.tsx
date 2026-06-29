'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Capture the hash globally before Supabase has a chance to clear it!
let initialCapturedHash = '';
if (typeof window !== 'undefined') {
  initialCapturedHash = window.location.hash;
}

export function AuthHashRedirector() {
  const router = useRouter();
  const supabase = createClient();
  const initialHashRef = useRef(initialCapturedHash);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = initialHashRef.current || window.location.hash;
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
