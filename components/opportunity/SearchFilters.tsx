'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'placement',   label: '🏢 Placement'   },
  { value: 'internship',  label: '💼 Internship'   },
  { value: 'hackathon',   label: '⚡ Hackathon'    },
  { value: 'scholarship', label: '🎓 Scholarship'  },
  { value: 'fellowship',  label: '🌟 Fellowship'   },
  { value: 'competition', label: '🏆 Competition'  },
  { value: 'other',       label: '📋 Other'        },
];

const SORTS = [
  { value: 'latest',   label: 'Most Recent' },
  { value: 'deadline', label: 'Deadline'    },
  { value: 'featured', label: 'Featured'    },
];

export function SearchFilters({ current }: { current: Record<string, string> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(current);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    startTransition(() => router.push(`/search?${params}`));
  }

  function clearAll() {
    startTransition(() => router.push('/search'));
  }

  const hasFilters = current.type || current.sort;

  return (
    <div className={`space-y-6 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Type filter */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Opportunity Type
        </p>
        <div className="space-y-1">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update('type', value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (current.type || '') === value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Sort By
        </p>
        <div className="space-y-1">
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update('sort', value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (current.sort || 'latest') === value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
