'use client';

import { useState, useEffect } from 'react';
import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { OpportunityCard } from '@/components/opportunity/OpportunityCard';
import { FilePlus2, Sparkles, AlertCircle, Loader2, CheckCircle2, Edit3, Send, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function NewListingPage() {
  const [draftOpportunities, setDraftOpportunities] = useState<any[]>([]);
  const [publishedIndices, setPublishedIndices] = useState<number[]>([]);
  const [contributionId, setContributionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDraft = window.location.search.includes('draft=true');
      if (isDraft) {
        const data = localStorage.getItem('draft_opportunities');
        const fallbackData = localStorage.getItem('draft_opportunity');
        const cid = localStorage.getItem('draft_contribution_id');

        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              setDraftOpportunities(parsed);
            } else {
              setDraftOpportunities([parsed]);
            }
          } catch (e) {
            console.error('Failed to parse draft opportunities', e);
          }
        } else if (fallbackData) {
          try {
            setDraftOpportunities([JSON.parse(fallbackData)]);
          } catch (e) {
            console.error('Failed to parse fallback draft', e);
          }
        }

        if (cid) setContributionId(cid);
      }
      setLoading(false);
    }
  }, []);

  function handleFormSuccess(index: number, isPublished: boolean, updatedData: any) {
    // 1. Update the draft data in state & localStorage
    const nextDrafts = [...draftOpportunities];
    nextDrafts[index] = updatedData;
    setDraftOpportunities(nextDrafts);
    localStorage.setItem('draft_opportunities', JSON.stringify(nextDrafts));

    // 2. If published, mark it in publishedIndices
    if (isPublished) {
      const nextPublished = [...publishedIndices, index];
      setPublishedIndices(nextPublished);
      
      if (nextPublished.length === draftOpportunities.length) {
        localStorage.removeItem('draft_opportunities');
        localStorage.removeItem('draft_opportunity');
        localStorage.removeItem('draft_opportunity_index');
        localStorage.removeItem('draft_contribution_id');
      }
    }
    setEditingIdx(null);
  }

  function handleClearDrafts() {
    const confirmed = confirm('Are you sure you want to clear all drafts? Any unsaved edits will be lost.');
    if (confirmed) {
      localStorage.removeItem('draft_opportunities');
      localStorage.removeItem('draft_opportunity');
      localStorage.removeItem('draft_opportunity_index');
      localStorage.removeItem('draft_contribution_id');
      setDraftOpportunities([]);
      setPublishedIndices([]);
      setEditingIdx(null);
    }
  }

  function buildPayload(opp: any) {
    const companyVal = opp.company || opp.basic_information?.company_name || '';
    const roleVal = opp.role || opp.job_details?.job_role || '';
    const typeVal = opp.type || opp.basic_information?.opportunity_type || 'placement';
    const salaryVal = opp.salary || opp.job_details?.salary_ctc || '';
    const locationVal = opp.location || opp.job_details?.location || '';
    const applyLinkVal = opp.apply_link || opp.basic_information?.jd_link || opp.attachments?.jd_link || '';
    const instructionsVal = opp.instructions || opp.communication?.additional_instructions || '';
    const deadlineVal = opp.deadline || opp.basic_information?.application_deadline || '';

    const TYPES = ['placement', 'internship', 'hackathon', 'scholarship', 'campus_drive', 'fellowship', 'competition', 'other'];
    const normalizedType = TYPES.includes(String(typeVal).toLowerCase())
      ? String(typeVal).toLowerCase()
      : 'placement';

    const safeParseArray = (val: any): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        return val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    const initialEligibility = opp.eligibility || {};
    const rawBranches = initialEligibility.branches || initialEligibility.eligible_branches;
    const initialBranches = safeParseArray(rawBranches);
    const initialCgpa = initialEligibility.cgpa || initialEligibility.minimum_cgpa_percentage || '';
    const initialBacklog = initialEligibility.backlog || initialEligibility.active_backlogs_allowed || '';
    const initialBatch = initialEligibility.batch || initialEligibility.passing_batch || '';
    const initialOther = initialEligibility.other || initialEligibility.cutoff_criteria || '';

    const initialSkills = safeParseArray(opp.skills);
    const initialResponsibilities = safeParseArray(opp.responsibilities || initialEligibility.responsibilities_list);
    const initialTags = safeParseArray(opp.tags);
    const initialDescription = safeParseArray(opp.interview_process?.description || opp.recruitment_process?.hiring_process);

    let parsedDeadline = null;
    if (deadlineVal && !isNaN(new Date(deadlineVal).getTime())) {
      parsedDeadline = new Date(deadlineVal).toISOString();
    }

    return {
      company: companyVal,
      role: roleVal,
      type: normalizedType,
      salary: salaryVal || null,
      location: locationVal || null,
      eligibility: {
        branches: initialBranches,
        cgpa: initialCgpa || null,
        backlog: initialBacklog || null,
        batch: initialBatch || null,
        other: initialOther || null,
        company_logo: opp.basic_information?.company_logo || '',
        round_name: opp.basic_information?.round_name || '',
        verified_status: opp.basic_information?.verified_status || '',
        educational_qualification: initialEligibility.educational_qualification || initialEligibility.education_qualification || '',
        eligible_branches: initialEligibility.eligible_branches || '',
        eligible_streams: initialEligibility.eligible_streams || '',
        passing_batch: initialEligibility.passing_batch || '',
        minimum_cgpa_percentage: initialEligibility.minimum_cgpa_percentage || '',
        cutoff_criteria: initialEligibility.cutoff_criteria || '',
        active_backlogs_allowed: initialEligibility.active_backlogs_allowed || '',
        gender_eligibility: initialEligibility.gender_eligibility || '',
        job_role: opp.job_details?.job_role || '',
        salary_ctc: opp.job_details?.salary_ctc || '',
        stipend: opp.job_details?.stipend || '',
        work_mode: opp.job_details?.work_mode || '',
        employment_type: opp.job_details?.employment_type || '',
        hiring_process: opp.recruitment_process?.hiring_process || '',
        number_of_rounds: opp.recruitment_process?.number_of_rounds || '',
        elimination_rounds: opp.recruitment_process?.elimination_rounds || '',
        event_date: opp.schedule?.event_date || '',
        time: opp.schedule?.time || '',
        venue: opp.schedule?.venue || '',
        mode: opp.schedule?.mode || '',
        communication_channel: opp.communication?.communication_channel || '',
        check_inbox: opp.communication?.check_inbox || '',
        check_spam_folder: opp.communication?.check_spam_folder || '',
        timing_shared_by: opp.communication?.timing_shared_by || '',
        student_eligible_list: opp.attachments?.student_eligible_list || '',
        additional_documents: opp.attachments?.additional_documents || '',
        issued_by: opp.source_metadata?.issued_by || '',
        institution: opp.source_metadata?.institution || '',
        reminder_notice: opp.source_metadata?.reminder_notice || '',
        notice_type: opp.source_metadata?.notice_type || '',
      },
      skills: initialSkills,
      responsibilities: initialResponsibilities,
      tags: initialTags,
      interview_process: {
        rounds: opp.interview_process?.rounds || null,
        description: initialDescription,
      },
      instructions: instructionsVal || null,
      apply_link: applyLinkVal || null,
      source_link: opp.source_link || null,
      deadline: parsedDeadline,
      contribution_id: (contributionId && contributionId !== 'undefined' && contributionId !== 'null') ? contributionId : null,
      is_published: true,
      featured: false,
    };
  }

  async function handlePublishIndividual(idx: number) {
    const opp = draftOpportunities[idx];
    const companyVal = opp.company || opp.basic_information?.company_name || `Company ${idx + 1}`;
    
    const confirmed = confirm(`Publish opportunity for "${companyVal}"?`);
    if (!confirmed) return;

    setLoading(true);
    const payload = buildPayload(opp);

    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Published opportunity for ${companyVal} successfully!`);
        const nextPublished = [...publishedIndices, idx];
        setPublishedIndices(nextPublished);

        if (nextPublished.length === draftOpportunities.length) {
          localStorage.removeItem('draft_opportunities');
          localStorage.removeItem('draft_opportunity');
          localStorage.removeItem('draft_opportunity_index');
          localStorage.removeItem('draft_contribution_id');
        }
      } else {
        const errData = await res.json();
        toast.error(`Failed to publish ${companyVal}: ${errData.error || 'Save failed'}`);
      }
    } catch (e) {
      toast.error(`Error publishing ${companyVal}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishAll() {
    const unpublishedIndices = draftOpportunities
      .map((_, idx) => idx)
      .filter((idx) => !publishedIndices.includes(idx));

    if (unpublishedIndices.length === 0) {
      toast.error('All drafts are already published!');
      return;
    }

    const confirmed = confirm(`Are you sure you want to publish all ${unpublishedIndices.length} remaining opportunities?`);
    if (!confirmed) return;

    setLoading(true);
    let successCount = 0;
    const newPublished = [...publishedIndices];

    for (const idx of unpublishedIndices) {
      const opp = draftOpportunities[idx];
      const payload = buildPayload(opp);
      const companyVal = payload.company || `Company ${idx + 1}`;

      try {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successCount++;
          newPublished.push(idx);
        } else {
          const errData = await res.json();
          console.error(`Failed to publish ${companyVal}:`, errData);
          toast.error(`Failed to publish ${companyVal}: ${errData.error || 'Save failed'}`);
        }
      } catch (e) {
        console.error(`Failed to publish ${companyVal}:`, e);
        toast.error(`Failed to publish ${companyVal}`);
      }
    }

    setPublishedIndices(newPublished);
    setLoading(false);

    if (successCount > 0) {
      toast.success(`Successfully published ${successCount} opportunities!`);
    }

    if (newPublished.length === draftOpportunities.length) {
      localStorage.removeItem('draft_opportunities');
      localStorage.removeItem('draft_opportunity');
      localStorage.removeItem('draft_opportunity_index');
      localStorage.removeItem('draft_contribution_id');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
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
            <div className="flex gap-2">
              <button
                onClick={handlePublishAll}
                className="text-xs font-bold px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Publish All ({draftOpportunities.length - publishedIndices.length})
              </button>
              <button
                onClick={handleClearDrafts}
                className="text-xs font-bold px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Drafts
              </button>
            </div>
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
                setEditingIdx(null);
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
          {draftOpportunities.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-6 flex gap-4 text-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-800">Review Opportunities</p>
                <p className="text-slate-600 text-xs">
                  Review the extracted companies in the cards below. Click <strong>Edit Details</strong> on any card to modify its fields, or click <strong>Publish All</strong> above to submit them all at once.
                </p>
              </div>
            </div>
          )}

          {draftOpportunities.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <OpportunityForm initialData={null} contributionId={contributionId} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {draftOpportunities.map((opp, idx) => {
                const isPublished = publishedIndices.includes(idx);
                
                const cardOpp = {
                  id: `preview-${idx}`,
                  company: opp.company || opp.basic_information?.company_name || `Company ${idx + 1}`,
                  role: opp.role || opp.job_details?.job_role || 'Job Role',
                  type: opp.type || opp.basic_information?.opportunity_type || 'placement',
                  salary: opp.salary || opp.job_details?.salary_ctc || null,
                  location: opp.location || opp.job_details?.location || null,
                  deadline: opp.deadline || opp.basic_information?.application_deadline || null,
                  eligibility: {
                    cgpa: opp.eligibility?.cgpa || opp.eligibility?.minimum_cgpa_percentage || null,
                    branches: opp.eligibility?.branches || (opp.eligibility?.eligible_branches ? [opp.eligibility.eligible_branches] : []),
                    batch: opp.eligibility?.batch || opp.eligibility?.passing_batch || null,
                    backlog: opp.eligibility?.backlog || opp.eligibility?.active_backlogs_allowed || null,
                  },
                  company_logo: opp.basic_information?.company_logo || null,
                };

                return (
                  <div 
                    key={idx}
                    className={`border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10 relative transition-all ${
                      isPublished ? 'border-emerald-300 shadow-md ring-1 ring-emerald-500/5 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    {isPublished && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </div>
                    )}
                    
                    <div className="mb-6 opacity-95">
                      <OpportunityCard opportunity={cardOpp} />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIdx(idx)}
                        disabled={isPublished}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </button>
                      <button
                        onClick={() => handlePublishIndividual(idx)}
                        disabled={isPublished || loading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inline Editing Modal */}
      {editingIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100"
          >
            <button 
              onClick={() => setEditingIdx(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold p-2 bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-slate-950 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                Edit Opportunity: {draftOpportunities[editingIdx]?.company || draftOpportunities[editingIdx]?.basic_information?.company_name || `Opportunity ${editingIdx + 1}`}
              </h2>
              <OpportunityForm 
                initialData={draftOpportunities[editingIdx]} 
                contributionId={contributionId}
                onSuccess={(isPublished, updatedData) => handleFormSuccess(editingIdx, isPublished, updatedData)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
