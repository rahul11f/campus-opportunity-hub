'use client';

import Link from 'next/link';
import {
  Briefcase,
  Calendar,
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

  const now = new Date();
  const end = new Date(deadline);

  const diff = Math.ceil(
    (end.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Ends today';
  if (diff <= 3) return `${diff} days left`;

  return `${diff} days left`;
}

export function OpportunityCard({
  opportunity,
  index = 0,
}: {
  opportunity: any;
  index?: number;
}) {
  return (
    <div className="rounded-3xl border bg-card overflow-hidden hover:border-primary transition">
      <div className="p-6 space-y-5">
        <div className="flex justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl border flex items-center justify-center bg-muted">
              {opportunity.company_logo ? (
                <img
                  src={opportunity.company_logo}
                  alt={opportunity.company}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>

            <div>
              <Link
                href={`/opportunities/${opportunity.id}`}
                className="text-2xl font-bold hover:text-primary"
              >
                {opportunity.role}
              </Link>

              <p className="text-muted-foreground mt-1">
                {opportunity.company}
              </p>
            </div>
          </div>

          {opportunity.featured && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold flex items-center gap-1 h-fit">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip icon={<Briefcase className="w-3 h-3" />}>
            {opportunity.type}
          </Chip>

          <Chip icon={<MapPin className="w-3 h-3" />}>
            {opportunity.location || 'Location TBD'}
          </Chip>

          <Chip icon={<IndianRupee className="w-3 h-3" />}>
            {opportunity.salary || 'Salary TBD'}
          </Chip>

          <Chip icon={<Clock3 className="w-3 h-3" />}>
            {deadlineLabel(opportunity.deadline)}
          </Chip>
        </div>

        {opportunity.eligibility && (
          <div className="rounded-2xl border p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-3 font-semibold">
              <GraduationCap className="w-4 h-4" />
              Eligibility
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {opportunity.eligibility.cgpa && (
                <MiniChip>
                  CGPA: {opportunity.eligibility.cgpa}
                </MiniChip>
              )}

              {opportunity.eligibility.batch && (
                <MiniChip>
                  Batch: {opportunity.eligibility.batch}
                </MiniChip>
              )}

              {opportunity.eligibility.branches?.map(
                (branch: string) => (
                  <MiniChip key={branch}>
                    {branch}
                  </MiniChip>
                )
              )}
            </div>
          </div>
        )}

        {opportunity.source_type === 'student' && (
          <div className="rounded-2xl border p-4 bg-green-500/5">
            <div className="flex items-center gap-2 text-green-400">
              <ShieldCheck className="w-4 h-4" />
              Student Verified Contribution
            </div>

            <p className="text-sm mt-2 text-muted-foreground">
              {opportunity.contributor_name || 'Student Contributor'}
            </p>
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

function Chip({
  children,
  icon,
}: any) {
  return (
    <span className="px-3 py-2 rounded-full border text-sm flex items-center gap-2">
      {icon}
      {children}
    </span>
  );
}

function MiniChip({
  children,
}: any) {
  return (
    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
      {children}
    </span>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-3xl border bg-card p-6 h-[420px] animate-pulse" />
  );
}