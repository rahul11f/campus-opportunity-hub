import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Star,
  User,
  MapPin,
  IndianRupee,
  GraduationCap,
} from 'lucide-react';
import { EligibilityChecker } from '@/components/student/EligibilityChecker';

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

export default async function OpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-8 space-y-8">
          <div className="flex justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-5xl font-bold">
                {data.role}
              </h1>

              <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                <Briefcase className="w-5 h-5" />
                {data.company}
              </div>
            </div>

            {data.featured && (
              <div className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Featured
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Chip>{data.type || 'Opportunity'}</Chip>

            <Chip icon={<Calendar className="w-4 h-4" />}>
              {deadlineLabel(data.deadline)}
            </Chip>

            <Chip icon={<MapPin className="w-4 h-4" />}>
              {data.location || 'Location TBD'}
            </Chip>

            <Chip icon={<IndianRupee className="w-4 h-4" />}>
              {data.salary || 'Compensation TBD'}
            </Chip>

            {data.source_type === 'student' && (
              <Chip
                className="bg-green-500/10 text-green-400 border-green-500/30"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Student Verified
              </Chip>
            )}
          </div>

          {data.eligibility && (
            <div className="rounded-3xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-xl font-bold">
                  Eligibility Criteria
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.eligibility.cgpa && (
                  <Mini>
                    CGPA: {data.eligibility.cgpa}
                  </Mini>
                )}

                {data.eligibility.batch && (
                  <Mini>
                    Batch: {data.eligibility.batch}
                  </Mini>
                )}

                {data.eligibility.branches?.map(
                  (branch: string) => (
                    <Mini key={branch}>
                      {branch}
                    </Mini>
                  )
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            {data.source_link && (
              <Link
                href={data.source_link}
                target="_blank"
                className="px-6 py-4 rounded-2xl bg-primary text-white font-semibold flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Apply / Visit Source
              </Link>
            )}

            <Link
              href="/opportunities"
              className="px-6 py-4 rounded-2xl border font-semibold"
            >
              Back
            </Link>
          </div>

          {data.source_type === 'student' && (
            <div className="rounded-3xl border p-6 bg-muted/20">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <div>
                  <p className="font-semibold">
                    {data.contributor_name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    ID: {data.contributor_student_id || 'N/A'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-green-400 text-sm">
                Verified and approved by campus admin.
              </p>
            </div>
          )}

          <div className="rounded-3xl border p-8 whitespace-pre-wrap leading-8">
            {data.instructions || data.raw_text}
          </div>
        </div>

        <div className="space-y-6">
          <EligibilityChecker
            opportunityId={data.id}
          />

          <div className="rounded-3xl border bg-card p-6">
            <h3 className="text-xl font-bold">
              Quick Info
            </h3>

            <div className="space-y-4 mt-5 text-sm">
              <Info
                label="Company"
                value={data.company}
              />
              <Info
                label="Role"
                value={data.role}
              />
              <Info
                label="Location"
                value={data.location || 'TBD'}
              />
              <Info
                label="Salary"
                value={data.salary || 'TBD'}
              />
              <Info
                label="Type"
                value={data.type}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  icon,
  className = '',
}: any) {
  return (
    <span className={`px-4 py-2 rounded-full border flex items-center gap-2 ${className}`}>
      {icon}
      {children}
    </span>
  );
}

function Mini({
  children,
}: any) {
  return (
    <span className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm">
      {children}
    </span>
  );
}

function Info({
  label,
  value,
}: any) {
  return (
    <div>
      <p className="text-muted-foreground">
        {label}
      </p>
      <p className="font-semibold">
        {value}
      </p>
    </div>
  );
}