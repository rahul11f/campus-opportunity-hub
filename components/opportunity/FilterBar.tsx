'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'placement', label: 'Placement' },
  { value: 'internship', label: 'Internship' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'campus_drive', label: 'Campus Drive' },
  { value: 'competition', label: 'Competition' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'featured', label: 'Featured' },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') || '';
  const currentSort = searchParams.get('sort') || 'latest';
  const currentQuery = searchParams.get('q') || '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      params.delete('page');

      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams();

    if (currentQuery) {
      params.set('q', currentQuery);
    }

    router.push(`/search?${params.toString()}`);
  };

  const hasFilters =
    currentType !== '' ||
    currentSort !== 'latest';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" />
          Filter:
        </span>

        {TYPES.map((type) => (
          <motion.button
            key={type.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateParam('type', type.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
              currentType === type.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {type.label}
          </motion.button>
        ))}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">
          Sort:
        </span>

        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                currentSort === opt.value
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
