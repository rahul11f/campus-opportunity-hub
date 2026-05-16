'use client';

import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ExternalLink,
  Star,
  User,
  ShieldCheck,
} from 'lucide-react';

function deadlineLabel(deadline?: string | null) {
  if (!deadline) return 'No deadline';

  const now = new Date();
  const end = new Date(deadline);

  const diff = Math.ceil(
    (end.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Ends today';

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
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="block group"
    >
      <div className="h-full rounded-3xl border bg-card p-6 transition hover:scale-[1.02] hover:border-primary space-y-5">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-bold group-hover:text-primary transition">
              {opportunity.role}
            </h3>

            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{opportunity.company}</span>
            </div>
          </div>

          {opportunity.featured && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
            {opportunity.type || 'Opportunity'}
          </span>

          <span className="px-3 py-1 rounded-full border text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {deadlineLabel(opportunity.deadline)}
          </span>

          {opportunity.source_type === 'student' && (
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Student Verified
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-6">
          {(opportunity.instructions || '')
            .replace(/\s+/g, ' ')
            .slice(0, 220)}
          ...
        </p>

        {opportunity.source_type === 'student' && (
          <div className="rounded-2xl border p-4 bg-muted/20">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span className="font-medium">
                {opportunity.contributor_name}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              ID: {opportunity.contributor_student_id || 'N/A'}
            </p>
          </div>
        )}

        {opportunity.source_link && (
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            Source Available
          </div>
        )}
      </div>
    </Link>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-3xl border bg-card p-6 h-[320px] animate-pulse" />
  );
}