'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useTransition } from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value?.trim() || '';
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    params.delete('page');
    startTransition(() => router.push(`/search?${params}`));
  }

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = '';
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    startTransition(() => router.push(`/search?${params}`));
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 bg-card focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all ${isPending ? 'opacity-70' : ''}`}>
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder="Search companies, roles, locations..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        {defaultValue && (
          <button type="button" onClick={clearSearch} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  );
}
