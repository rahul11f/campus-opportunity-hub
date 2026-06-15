import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Star,
  MapPin,
  IndianRupee,
  GraduationCap,
  Clock3,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  Users,
  CheckCircle2,
  FileText,
  Zap,
  Building2,
} from 'lucide-react';
import { EligibilityChecker } from '@/components/student/EligibilityChecker';
import { OpportunityDetailTabs } from '@/components/opportunity/OpportunityDetailTabs';
import { StudentOpportunityActions } from '@/components/auth/StudentOpportunityActions';
import { BackButton } from '@/components/shared/BackButton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(d?: string | null) {
  if (!d) return 'No deadline';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServiceClient();
  const { data } = await supabase.from('opportunities').select('role,company,type').eq('id', params.id).single();
  if (!data) return { title: 'Opportunity - Campus Hub' };
  return {
    title: `${data.role} at ${data.company} | Campus Opportunity Hub`,
    description: `Apply for ${data.role} at ${data.company}. Find more ${data.type} opportunities on Campus Hub.`,
  };
}

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('opportunities').select('*').eq('id', params.id).maybeSingle();

  if (!data) notFound();

  // Increment view count (fire and forget)
  supabase.from('opportunities').update({ views_count: (data.views_count || 0) + 1 }).eq('id', params.id).then(() => {});

  const days = daysLeft(data.deadline);
  const isExpired = data.is_expired || (days !== null && days < 0);
  const applyLink = data.apply_link || data.registration_link || data.source_link;

  // Related opportunities
  const { data: related } = await supabase
    .from('opportunities')
    .select('id, role, company, type, deadline')
    .eq('is_published', true)
    .eq('is_expired', false)
    .eq('type', data.type)
    .neq('id', params.id)
    .limit(4);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-foreground transition-colors">Opportunities</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{data.role}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border bg-card p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              {/* Company Logo */}
              <div className="w-16 h-16 rounded-2xl border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {data.company_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.company_logo} alt={data.company} className="w-12 h-12 object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">{data.role}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {data.company}
                      {data.source_type === 'student' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </p>
                  </div>
                  {data.featured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-500 border border-yellow-500/20 text-sm font-medium shrink-0">
                      <Star className="w-3.5 h-3.5" /> Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <MetaChip icon={<Briefcase className="w-3.5 h-3.5" />} label={data.type || 'Opportunity'} className="type-badge-internship" />
              {data.location && <MetaChip icon={<MapPin className="w-3.5 h-3.5" />} label={data.location} />}
              {data.salary && <MetaChip icon={<IndianRupee className="w-3.5 h-3.5" />} label={data.salary} />}
              {data.deadline ? (
                <MetaChip
                  icon={<Clock3 className="w-3.5 h-3.5" />}
                  label={isExpired ? 'Expired' : days === 0 ? 'Ends today' : `${days} days left`}
                  className={isExpired ? 'bg-red-500/10 text-red-500 border-red-500/20' : days !== null && days <= 3 ? 'bg-red-500/10 text-red-500 border-red-500/20' : days !== null && days <= 7 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}
                />
              ) : (
                <MetaChip icon={<Clock3 className="w-3.5 h-3.5" />} label="No deadline" />
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 flex-wrap">
              {applyLink && !isExpired && (
                <a
                  href={applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/20 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply Now
                </a>
              )}
              <StudentOpportunityActions opportunityId={data.id} applyLink={applyLink} />
              <BackButton fallbackUrl="/search" />
            </div>

            {isExpired && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                <Clock3 className="w-4 h-4 shrink-0" />
                This opportunity has expired. Application deadline has passed.
              </div>
            )}
          </div>

          {/* Tabs */}
          <OpportunityDetailTabs data={data} />
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Quick Info */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Quick Info
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Company" value={data.company} />
              <InfoRow label="Role" value={data.role} />
              <InfoRow label="Type" value={data.type} />
              <InfoRow label="Location" value={data.location || 'TBD'} />
              <InfoRow label="Salary / Stipend" value={data.salary || 'TBD'} />
              <InfoRow label="Deadline" value={formatDate(data.deadline)} />
              {data.interview_mode && <InfoRow label="Mode" value={data.interview_mode} />}
              {data.joining_date && <InfoRow label="Joining" value={data.joining_date} />}
              <InfoRow label="Views" value={`${(data.views_count || 0).toLocaleString()} views`} />
            </div>
          </div>

          {/* AI Eligibility Checker */}
          <EligibilityChecker opportunityId={data.id} />

          {/* Related Opportunities */}
          {(related?.length ?? 0) > 0 && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Similar Opportunities
              </h3>
              <div className="space-y-3">
                {related!.map((item) => {
                  const d = daysLeft(item.deadline);
                  return (
                    <Link
                      key={item.id}
                      href={`/opportunities/${item.id}`}
                      className="block p-3 rounded-xl border hover:border-primary/30 hover:bg-accent transition-all"
                    >
                      <p className="font-medium text-sm line-clamp-1">{item.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.company}</p>
                      {d !== null && d >= 0 && (
                        <p className="text-xs text-green-500 mt-1">{d} days left</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contributor info */}
          {data.source_type === 'student' && (
            <div className="rounded-2xl border bg-card p-5 bg-green-500/5">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold text-sm">Student Contribution</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted by <strong className="text-foreground">{data.contributor_name || 'a student'}</strong> and verified by campus admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label, className = '' }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${className || 'border-border bg-muted/50'}`}>
      {icon} {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}