'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ fallbackUrl = '/search', className = '' }: { fallbackUrl?: string, className?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // If the browser history has a previous page within our app, it will go back.
    // However, checking window.history.length isn't foolproof for single-page apps.
    // The safest approach for native feel is calling back(). If they landed directly, 
    // it might leave the site, but typically users expect standard browser back behavior.
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border bg-card text-sm font-medium hover:bg-accent transition-colors shadow-sm ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}
