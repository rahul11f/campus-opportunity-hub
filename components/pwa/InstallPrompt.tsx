'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);

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
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-primary text-white p-3 rounded-2xl shadow-xl w-48 mb-2">
          <p className="font-bold mb-1">Install CampusHub</p>
          <p className="text-sm opacity-90 mb-3">Faster access from your home screen</p>
          <button
            onClick={() => { promptEvent.prompt(); setIsOpen(false); }}
            className="w-full bg-white text-primary py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Install Now
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Download className="w-5 h-5 md:w-6 md:h-6" />}
      </button>
    </div>
  );
}