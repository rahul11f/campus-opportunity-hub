'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted rounded-full z-10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
        <div className="overflow-y-auto p-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
