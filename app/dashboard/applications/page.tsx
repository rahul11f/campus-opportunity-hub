import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  FileText,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

function getStatusBadge(status: string) {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('selected') || normalized.includes('accepted')) {
    return {
      label: status,
      className: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle,
    };
  }

  if (normalized.includes('rejected')) {
    return {
      label: status,
      className: 'bg-red-100 text-red-700',
      icon: AlertCircle,
    };
  }

  return {
    label: status || 'Applied',
    className: 'bg-amber-100 text-amber-700',
    icon: Clock,
  };
}

export default async function ApplicationsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      notes,
      created_at,
      opportunities (
        id,
        company,
        role,
        location,
        salary
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Application Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor your submitted applications and statuses.
        </p>
      </div>

      <div className="space-y-5">
        {applications?.length ? (
          applications.map((item: any) => {
            const badge = getStatusBadge(item.status);
            const StatusIcon = badge.icon;

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold">
                          {item.opportunities?.role}
                        </h2>

                        <p className="text-muted-foreground">
                          {item.opportunities?.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                      {item.opportunities?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.opportunities.location}
                        </span>
                      )}

                      {item.opportunities?.salary && (
                        <span>
                          {item.opportunities.salary}
                        </span>
                      )}
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${badge.className}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {badge.label}
                    </div>

                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/opportunities/${item.opportunities?.id}`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground"
                  >
                    View Opportunity
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <FileText className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              No applications tracked
            </h2>
            <p className="text-muted-foreground">
              Apply to opportunities to see tracking here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}