'use client';

import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handler
    );

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handler
      );
  }, []);

  if (!promptEvent) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 rounded-3xl bg-primary text-white p-5 shadow-2xl">
      <div className="flex justify-between items-center gap-4">
        <div>
          <p className="font-bold">
            Install CampusHub App
          </p>
          <p className="text-sm opacity-90">
            Faster access from your home screen
          </p>
        </div>

        <button
          onClick={() => promptEvent.prompt()}
          className="bg-white text-primary px-5 py-3 rounded-2xl font-semibold"
        >
          Install
        </button>
      </div>
    </div>
  );
}