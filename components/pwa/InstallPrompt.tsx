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
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl w-56 mb-2 border border-border">
          <p className="font-bold mb-1">Install CampusHub</p>
          <p className="text-sm opacity-90 mb-4">Add to home screen for faster access and native app feel</p>
          <button
            onClick={() => { promptEvent.prompt(); setIsOpen(false); }}
            className="w-full bg-background text-foreground py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            Install Now
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-3.5 md:p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center border border-border"
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Download className="w-5 h-5 md:w-6 md:h-6" />}
      </button>
    </div>
  );
}