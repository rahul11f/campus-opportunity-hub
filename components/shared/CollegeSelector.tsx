'use client';

import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

interface College {
  id: string;
  name: string;
  slug: string;
}

export function CollegeSelector({
  colleges,
  currentSlug,
}: {
  colleges: College[];
  currentSlug?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />

      <select
        value={currentSlug || ''}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/${e.target.value}`);
          }
        }}
        className="border rounded-xl px-3 py-2 bg-background text-sm"
      >
        <option value="">Choose College</option>

        {colleges.map((college) => (
          <option
            key={college.id}
            value={college.slug}
          >
            {college.name}
          </option>
        ))}
      </select>
    </div>
  );
}
