'use client';

import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  GraduationCap,
  Building2,
  ShieldCheck,
  Star,
  Clock3,
} from 'lucide-react';
import { StudentOpportunityActions } from '@/components/auth/StudentOpportunityActions';

function deadlineLabel(deadline?: string | null) {
  if (!deadline) return 'Open';

  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) /
    (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Ends today';
  return `${diff} days left`;
}

export function OpportunityCard({
  opportunity,
}: {
  opportunity: any;
}) {
  return (
    <div className="opportunity-card group overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl border bg-background shadow-sm flex items-center justify-center shrink-0">
              {opportunity.company_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opportunity.company_logo}
                  alt={opportunity.company}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              <Link
                href={`/opportunities/${opportunity.id}`}
                className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors line-clamp-2"
              >
                {opportunity.role}
              </Link>

              <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">
                {opportunity.company}
              </p>
            </div>
          </div>

          {opportunity.featured && (
            <span className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1 h-fit shrink-0">
              <Star className="w-3 h-3 fill-amber-500/50" />
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip icon={<Briefcase className="w-3 h-3" />}>
            {opportunity.type || 'Opportunity'}
          </Chip>

          <Chip icon={<MapPin className="w-3 h-3" />}>
            {opportunity.location || 'TBD'}
          </Chip>

          <Chip icon={<IndianRupee className="w-3 h-3" />}>
            {opportunity.salary || 'TBD'}
          </Chip>

          <Chip icon={<Clock3 className="w-3 h-3" />}>
            {deadlineLabel(opportunity.deadline)}
          </Chip>
        </div>

        {opportunity.eligibility && (
          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-2 mb-2 font-medium text-sm">
              <GraduationCap className="w-4 h-4" />
              Eligibility
            </div>

            <div className="flex flex-wrap gap-2">
              {opportunity.eligibility.cgpa && (
                <MiniChip>CGPA {opportunity.eligibility.cgpa}</MiniChip>
              )}

              {opportunity.eligibility.batch && (
                <MiniChip>Batch {opportunity.eligibility.batch}</MiniChip>
              )}
            </div>
          </div>
        )}

        {opportunity.source_type === 'student' && (
          <div className="rounded-xl border p-3 bg-green-500/5 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <ShieldCheck className="w-4 h-4" />
              Student Verified
            </div>
          </div>
        )}

        <StudentOpportunityActions
          opportunityId={opportunity.id}
          applyLink={
            opportunity.apply_link ||
            opportunity.registration_link ||
            opportunity.source_link
          }
        />
      </div>
    </div>
  );
}

function Chip({ children, icon }: any) {
  return (
    <span className="px-2.5 py-1 rounded-md border bg-card shadow-sm text-xs font-semibold text-foreground/80 flex items-center gap-1.5 transition-colors group-hover:border-border">
      {icon}
      {children}
    </span>
  );
}

function MiniChip({ children }: any) {
  return (
    <span className="px-2 py-0.5 rounded-md border bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold">
      {children}
    </span>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card h-[320px] animate-pulse" />
  );
}