'use client';

import { useState, useEffect } from 'react';
import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { FilePlus2, Sparkles, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewListingPage() {
  const [draftOpportunities, setDraftOpportunities] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [publishedIndices, setPublishedIndices] = useState<number[]>([]);
  const [contributionId, setContributionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDraft = window.location.search.includes('draft=true');
      if (isDraft) {
        const data = localStorage.getItem('draft_opportunities');
        const fallbackData = localStorage.getItem('draft_opportunity');
        const cid = localStorage.getItem('draft_contribution_id');
        const indexStr = localStorage.getItem('draft_opportunity_index') || '0';

        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              setDraftOpportunities(parsed);
              setSelectedIdx(Number(indexStr));
            } else {
              setDraftOpportunities([parsed]);
              setSelectedIdx(0);
            }
          } catch (e) {
            console.error('Failed to parse draft opportunities', e);
          }
        } else if (fallbackData) {
          try {
            setDraftOpportunities([JSON.parse(fallbackData)]);
            setSelectedIdx(0);
          } catch (e) {
            console.error('Failed to parse fallback draft', e);
          }
        }

        if (cid) setContributionId(cid);
      }
      setLoading(false);
    }
  }, []);

  function handlePublishSuccess(index: number) {
    if (!publishedIndices.includes(index)) {
      const nextPublished = [...publishedIndices, index];
      setPublishedIndices(nextPublished);
      
      if (nextPublished.length === draftOpportunities.length) {
        localStorage.removeItem('draft_opportunities');
        localStorage.removeItem('draft_opportunity');
        localStorage.removeItem('draft_opportunity_index');
        localStorage.removeItem('draft_contribution_id');
      } else {
        const nextUnpublishedIdx = draftOpportunities.findIndex((_, idx) => !nextPublished.includes(idx));
        if (nextUnpublishedIdx !== -1) {
          setSelectedIdx(nextUnpublishedIdx);
        }
      }
    }
  }

  function handleClearDrafts() {
    const confirmed = confirm('Are you sure you want to clear all drafts? Any unsaved edits will be lost.');
    if (confirmed) {
      localStorage.removeItem('draft_opportunities');
      localStorage.removeItem('draft_opportunity');
      localStorage.removeItem('draft_opportunity_index');
      localStorage.removeItem('draft_contribution_id');
      setDraftOpportunities([]);
      setSelectedIdx(0);
      setPublishedIndices([]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const hasMultiple = draftOpportunities.length > 1;
  const allPublished = draftOpportunities.length > 0 && publishedIndices.length === draftOpportunities.length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FilePlus2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manual Data Entry</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Comprehensive form for database insertion
              </p>
            </div>
          </div>

          {draftOpportunities.length > 0 && !allPublished && (
            <button
              onClick={handleClearDrafts}
              className="text-xs font-bold px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              Clear Drafts
            </button>
          )}
        </div>
      </motion.div>

      {allPublished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6 max-w-lg mx-auto mt-12"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-950">All Drafts Published!</h2>
            <p className="text-sm text-slate-500">
              Congratulations! You have successfully reviewed and published all extracted opportunities to the database.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setDraftOpportunities([]);
                setPublishedIndices([]);
                setSelectedIdx(0);
              }}
              className="px-5 py-2.5 rounded-xl border font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Start New Manual Form
            </button>
            <a
              href="/admin/listings"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors block"
            >
              Go to All Listings
            </a>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Multiple tabs selector */}
          {hasMultiple && (
            <div className="mb-6 flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {draftOpportunities.map((opp, idx) => {
                const companyName = opp.basic_information?.company_name || opp.company || `Opportunity ${idx + 1}`;
                const roleName = opp.job_details?.job_role || opp.role || 'Details';
                const isSelected = selectedIdx === idx;
                const isPublished = publishedIndices.includes(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                        : isPublished
                        ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50/50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {isPublished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    <span className="truncate max-w-[120px]">{companyName}</span>
                    <span className="opacity-60 font-medium">({roleName})</span>
                  </button>
                );
              })}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-6 flex gap-4 text-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-800">Strict Typings Enforced</p>
                <p className="text-slate-600 text-xs">
                  All fields map directly to the <code className="text-slate-900 font-bold">opportunities</code> JSONB schema. Please ensure high accuracy for student eligibility matching.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              {draftOpportunities.length === 0 ? (
                <OpportunityForm initialData={null} contributionId={contributionId} />
              ) : (
                draftOpportunities.map((opp, idx) => (
                  <div key={idx} className={idx === selectedIdx ? 'block' : 'hidden'}>
                    <OpportunityForm 
                      initialData={opp} 
                      contributionId={contributionId}
                      onSuccess={() => handlePublishSuccess(idx)}
                    />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
