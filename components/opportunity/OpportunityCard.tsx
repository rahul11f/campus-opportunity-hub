'use client';

import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Building2,
  Clock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { useEffect, useState } from 'react';

function CountdownTimer({ deadline }: { deadline: string | null }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!deadline) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) {
    return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Open Always</span>;
  }

  if (!timeLeft) return null; // initial render

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return <span className="text-red-500 font-medium">Expired</span>;
  }

  const isUrgent = timeLeft.days < 3;

  return (
    <div className={`flex items-center gap-1.5 font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-muted-foreground'}`}>
      <Clock className="w-4 h-4" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours}h left
      </span>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
}: {
  opportunity: any;
}) {
  return (
    <div className="group flex flex-col bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Header section */}
      <div className="p-6 pb-4 flex gap-4">
        <div className="w-12 h-12 rounded-lg border border-slate-100 dark:border-border bg-slate-50 dark:bg-background flex items-center justify-center shrink-0 p-1">
          {opportunity.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={opportunity.company_logo}
              alt={opportunity.company}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          ) : (
            <Building2 className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="text-lg font-bold text-slate-900 dark:text-foreground line-clamp-1 group-hover:text-primary transition-colors"
          >
            {opportunity.role}
          </Link>
          <div className="text-sm font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
            {opportunity.company}
          </div>
        </div>
      </div>

      {/* Tags section */}
      <div className="px-6 pb-6 flex flex-wrap gap-2 flex-1">
        <Chip icon={<Briefcase className="w-3.5 h-3.5" />}>
          {opportunity.type || 'Role'}
        </Chip>
        <Chip icon={<MapPin className="w-3.5 h-3.5" />}>
          {opportunity.location || 'Remote'}
        </Chip>
        {opportunity.salary && (
          <Chip icon={<IndianRupee className="w-3.5 h-3.5" />}>
            {opportunity.salary}
          </Chip>
        )}
        {opportunity.eligibility?.cgpa && (
          <Chip icon={<GraduationCap className="w-3.5 h-3.5" />}>
            {opportunity.eligibility.cgpa} CGPA+
          </Chip>
        )}
      </div>

      {/* Footer section */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-muted/50 border-t border-slate-100 dark:border-border flex items-center justify-between text-sm">
        <CountdownTimer deadline={opportunity.deadline} />
        
        <Link
          href={`/opportunities/${opportunity.id}`}
          className="flex items-center gap-1.5 font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-background text-xs font-semibold text-slate-600 dark:text-muted-foreground border border-slate-200 dark:border-border">
      {icon}
      {children}
    </span>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white h-[240px] animate-pulse" />
  );
}