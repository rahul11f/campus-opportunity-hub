'use client';

import { useEffect, useState } from 'react';

const FLAG_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  gemini_enabled:        { label: 'Gemini AI',        description: 'AI-powered opportunity extraction',      icon: '🤖' },
  ocr_enabled:           { label: 'OCR Scanning',      description: 'Image-to-text for notices',             icon: '🔍' },
  scraper_enabled:       { label: 'Web Scraper',       description: 'Auto-scrape from external sources',     icon: '🕸️' },
  leaderboard_enabled:   { label: 'Leaderboard',       description: 'Student points and rankings',           icon: '🏆' },
  contributions_enabled: { label: 'Contributions',     description: 'Student notice submissions',            icon: '📝' },
  homepage_ads_enabled:  { label: 'Homepage Ads',      description: 'Display ads on homepage',              icon: '📢' },
  dashboard_ads_enabled: { label: 'Dashboard Ads',     description: 'Display ads in student dashboard',     icon: '📊' },
};

export function AdminControlCenter() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(setFlags);
  }, []);

  async function toggle(key: string) {
    const next = { ...flags, [key]: !flags[key] };
    setFlags(next);
    setSaving(key);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Object.entries(FLAG_LABELS).map(([key, { label, description, icon }]) => {
        const isOn = !!flags[key];
        const isSaving = saving === key;
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            disabled={isSaving}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              isOn
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            } ${isSaving ? 'opacity-60 cursor-wait' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{icon}</span>
              {/* Toggle indicator */}
              <div className={`w-8 h-4 rounded-full transition-colors relative ${isOn ? 'bg-blue-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isOn ? 'left-4' : 'left-0.5'}`} />
              </div>
            </div>
            <p className={`text-sm font-semibold ${isOn ? 'text-blue-700' : 'text-slate-700'}`}>{label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
