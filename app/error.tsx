'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>

        <p className="mt-4 text-muted-foreground">
          An unexpected error occurred while loading this page.
        </p>

        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-primary px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

