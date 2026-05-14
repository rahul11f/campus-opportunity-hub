'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, IndianRupee, Calendar, Star, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import { Opportunity, OpportunityType } from '@/types/opportunity';

const TYPE_LABELS: Record<OpportunityType, string> = {
  placement: 'Placement',
  internship: 'Internship',
  hackathon: 'Hackathon',
  scholarship: 'Scholarship',
  campus_drive: 'Campus Drive',
  fellowship: 'Fellowship',
  competition: 'Competition',
  other: 'Other',
};

function DeadlineChip({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;

  let date: Date;
  try { date = parseISO(deadline); } catch { return null; }

  const days = differenceInDays(date, new Date());
  const label =
    days < 0
      ? 'Expired'
      : days === 0
      ? 'Today!'
      : days === 1
      ? 'Tomorrow'
      : `${days}d left`;

  const cls =
    days < 0
      ? 'text-muted-foreground line-through'
      : days <= 2
      ? 'deadline-urgent font-semibold'
      : days <= 7
      ? 'deadline-warning font-medium'
      : 'deadline-safe';

  return (
    <span className={`text-xs flex items-center gap-1 ${cls}`}>
      <Calendar className="w-3 h-3" />
      {label}
    </span>
  );
}

function CompanyAvatar({ company }: { company: string }) {
  const letter = company.trim()[0]?.toUpperCase() || '?';
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500',
  ];
  const color = colors[letter.charCodeAt(0) % colors.length];

  return (
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {letter}
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  index?: number;
}

export function OpportunityCard({ opportunity, index = 0 }: OpportunityCardProps) {
  const {
    id, company, role, type, salary, location, deadline, tags, featured, skills,
  } = opportunity;

  const postedAgo = formatDistanceToNow(parseISO(opportunity.created_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/opportunities/${id}`} className="block group">
        <article className="opportunity-card p-5 relative overflow-hidden">
          {featured && (
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                <Star className="w-2.5 h-2.5" />
                Featured
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <CompanyAvatar company={company} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-snug truncate group-hover:text-primary transition-colors">
                    {role}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{company}</p>
                </div>
                <span
                  className={`type-badge-${type} text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize`}
                >
                  {TYPE_LABELS[type]}
                </span>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            {salary && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {salary}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {postedAgo}
            </span>
            <DeadlineChip deadline={deadline} />
          </div>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[11px] text-muted-foreground px-1 py-0.5">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {opportunity.views_count} views
            </span>
            <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
              View Details
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="opportunity-card p-5">
      <div className="flex gap-3">
        <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      <div className="flex gap-1.5 mt-3">
        <div className="skeleton h-5 w-14 rounded-md" />
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-12 rounded-md" />
      </div>
    </div>
  );
}
