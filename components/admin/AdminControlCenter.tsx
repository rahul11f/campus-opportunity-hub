'use client';

import { useEffect, useState } from 'react';

export function AdminControlCenter() {
  const [flags, setFlags] = useState<any>({});

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(setFlags);
  }, []);

  async function toggle(key: string) {
    const next = {
      ...flags,
      [key]: !flags[key],
    };

    setFlags(next);

    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(next),
    });
  }

  const items = [
    'gemini_enabled',
    'ocr_enabled',
    'scraper_enabled',
    'leaderboard_enabled',
    'contributions_enabled',
    'homepage_ads_enabled',
    'dashboard_ads_enabled',
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => toggle(item)}
          className={`border rounded-2xl p-5 text-left ${
            flags[item]
              ? 'bg-green-600 text-white'
              : 'bg-card'
          }`}
        >
          <p className="font-semibold">
            {item}
          </p>
        </button>
      ))}
    </div>
  );
}
