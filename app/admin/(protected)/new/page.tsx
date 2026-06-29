'use client';

import { useState } from 'react';
import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { FilePlus2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewListingPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <FilePlus2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Manual Data Entry</h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Comprehensive form for accurate database insertion
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 mb-6 flex gap-4 text-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-500">Strict Typings Enforced</p>
            <p className="text-gray-400 text-xs">
              All fields map directly to the <code className="text-gray-300">opportunities</code> JSONB schema. Please ensure high accuracy for student eligibility matching.
            </p>
          </div>
        </div>

        <div className="bg-background/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
          <OpportunityForm />
        </div>
      </motion.div>
    </div>
  );
}
