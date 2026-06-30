import { createServiceClient } from '@/lib/supabase/server';
import { List, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ALL_CATEGORIES = [
  'internship',
  'placement',
  'campus_drive',
  'hackathon',
  'scholarship',
  'fellowship',
  'competition',
  'other',
];

export default async function CategoriesPage() {
  const supabase = createServiceClient();
  const { data: opportunities } = await supabase.from('opportunities').select('type');

  const counts = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  if (opportunities) {
    opportunities.forEach(opp => {
      const t = opp.type?.toLowerCase() || 'other';
      if (counts[t] !== undefined) {
        counts[t]++;
      } else {
        counts['other']++;
      }
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage opportunity categories and view their stats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_CATEGORIES.map(cat => (
          <div key={cat} className="admin-card rounded-xl p-5 border border-slate-200 bg-white flex flex-col items-center text-center justify-center relative hover:border-blue-500 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <List className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 capitalize">{cat.replace('_', ' ')}</h3>
            <p className="text-sm text-slate-500 mt-1">{counts[cat]} Opportunities</p>
            
            <Link href="/admin/listings" className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
