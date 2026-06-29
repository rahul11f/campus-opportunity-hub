'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight, Briefcase } from 'lucide-react';

export function HeroSection({
  totalOps,
  students,
  featuredCount,
}: {
  totalOps: number;
  students: number;
  featuredCount: number;
}) {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-white dark:bg-background border-b border-border/40">
      <div className="relative max-w-7xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border text-sm font-medium mb-8">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 dark:text-muted-foreground">Now tracking <strong className="text-slate-900 dark:text-foreground font-semibold">{totalOps}</strong> live opportunities</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
          Launch your career before graduation.
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-muted-foreground mb-10 leading-relaxed">
          The definitive platform for campus placements, internships, and hackathons. 
          Sourced from your community, verified by administrators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Explore Opportunities
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contribute"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-background text-slate-700 dark:text-foreground font-semibold hover:bg-slate-50 dark:hover:bg-muted transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Post an Opportunity
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-24 pt-8 border-t border-slate-100 dark:border-border w-full max-w-3xl">
          <StatBlock value={students} label="Active Students" />
          <StatBlock value={totalOps} label="Live Listings" />
          <StatBlock value={featuredCount} label="Featured" />
        </div>
      </div>
    </section>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">{value}+</span>
      <span className="text-sm font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}
