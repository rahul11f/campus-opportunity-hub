'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthHashRedirector() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        if (hash.includes('type=recovery')) {
          router.replace('/update-password');
        } else if (hash.includes('type=magiclink') || hash.includes('type=signup')) {
          router.replace('/dashboard');
        }
      }
    }
  }, [router]);

  return null;
}
