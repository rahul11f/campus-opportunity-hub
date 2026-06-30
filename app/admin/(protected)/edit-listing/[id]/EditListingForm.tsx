'use client';

import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

export function EditListingForm({
  listing,
}: {
  listing: any;
}) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Pencil className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Opportunity</h1>
            <p className="text-sm text-slate-500 mt-1">
              Modify details, requirements, and eligibility criteria
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl"
      >
        <OpportunityForm initialData={listing} existingId={listing.id} />
      </motion.div>
    </div>
  );
}