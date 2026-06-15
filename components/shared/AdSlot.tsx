'use client';

import { useEffect, useState } from 'react';

// This acts as a global mock state since we don't have a settings table yet.
// In a real production setup with the backend settings table, we would fetch this via API.
export const IS_ADS_ENABLED = false;

export function AdSlot({ slot, className = '' }: { slot: string; className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check local storage for quick initial load
    const adminAdsEnabled = localStorage.getItem('admin_ads_enabled') === 'true';
    setEnabled(adminAdsEnabled || IS_ADS_ENABLED);

    // Fetch live from settings database API to ensure perfect synchronization
    fetch('/api/admin/settings')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not ok');
      })
      .then((data) => {
        if (data && typeof data.enableAds === 'boolean') {
          setEnabled(data.enableAds);
          localStorage.setItem('admin_ads_enabled', String(data.enableAds));
        }
      })
      .catch((err) => console.log('Settings loading fallback:', err));
  }, []);

  if (!enabled) return null;

  return (
    <div className={`w-full bg-muted/20 border rounded-xl flex flex-col items-center justify-center p-4 text-center overflow-hidden relative ${className}`}>
      <span className="absolute top-1 left-2 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Advertisement</span>
      
      {/* Google AdSense Code would go here */}
      {/* 
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script> 
      */}

      <div className="w-full h-full min-h-[100px] flex items-center justify-center border border-dashed border-muted-foreground/30 rounded-lg">
        <p className="text-xs text-muted-foreground">Ad Slot: {slot}</p>
      </div>
    </div>
  );
}
