'use client';

import { useEffect, useRef, useState } from 'react';

type AdPosition = 'banner' | 'in-feed' | 'detail-rail' | 'footer';

const AD_DIMENSIONS: Record<AdPosition, { desktop: string; mobile: string }> = {
  banner: { desktop: '728x90', mobile: '320x50' },
  'in-feed': { desktop: '300x250', mobile: '300x250' },
  'detail-rail': { desktop: '300x600', mobile: '300x250' },
  footer: { desktop: '728x90', mobile: '320x50' },
};

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isProduction = process.env.NODE_ENV === 'production';
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      <p className="text-[10px] text-muted-foreground text-center mb-1 uppercase tracking-wider">
        Advertisement
      </p>
      {isVisible && isProduction && adClientId ? (
        <div className="flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adClientId}
            data-ad-slot={`slot-${position}`}
            data-ad-format={position === 'banner' || position === 'footer' ? 'horizontal' : 'rectangle'}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div
          className={`
            flex items-center justify-center bg-muted/50 border border-dashed border-border rounded-lg
            text-xs text-muted-foreground
            ${position === 'banner' || position === 'footer'
              ? 'h-[90px] md:w-[728px] w-[320px] mx-auto'
              : position === 'detail-rail'
              ? 'h-[250px] w-[300px] mx-auto'
              : 'h-[250px] w-[300px] mx-auto'}
          `}
        >
          <div className="text-center">
            <div className="text-muted-foreground/50 font-mono">AD</div>
            <div className="text-[10px] opacity-50">{AD_DIMENSIONS[position].desktop}</div>
          </div>
        </div>
      )}
    </div>
  );
}
