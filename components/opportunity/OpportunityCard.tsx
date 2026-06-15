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
    <div className="rounded-2xl border bg-card hover:shadow-xl hover:border-primary transition-all duration-300 overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl border bg-muted flex items-center justify-center shrink-0">
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
                className="text-lg md:text-xl font-bold hover:text-primary line-clamp-2"
              >
                {opportunity.role}
              </Link>

              <p className="text-sm text-muted-foreground truncate">
                {opportunity.company}
              </p>
            </div>
          </div>

          {opportunity.featured && (
            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1 h-fit shrink-0">
              <Star className="w-3 h-3" />
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
          <div className="rounded-xl border p-3 bg-muted/20">
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
    <span className="px-3 py-1.5 rounded-full border text-xs flex items-center gap-1">
      {icon}
      {children}
    </span>
  );
}

function MiniChip({ children }: any) {
  return (
    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
      {children}
    </span>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card h-[320px] animate-pulse" />
  );
}