import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Edit, Eye, CheckCircle, XCircle, Star } from 'lucide-react';
import { ListingsActions } from './ListingsActions';

export const metadata: Metadata = { title: 'All Listings | Admin' };

async function getListings(page = 1) {
  const supabase = createClient();
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, count } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { listings: data || [], total: count || 0 };
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { listings, total } = await getListings(page);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total opportunities</p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Company / Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Deadline</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Views</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                    No listings yet.{' '}
                    <Link href="/admin/new" className="text-primary hover:underline">
                      Create one â†’
                    </Link>
                  </td>
                </tr>
              ) : (
                listings.map((listing: any) => (
                  <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{listing.role}</p>
                        <p className="text-xs text-muted-foreground">{listing.company}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`type-badge-${listing.type} text-[11px] font-medium px-2 py-0.5 rounded-full capitalize`}>
                        {listing.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {listing.is_published ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="w-3 h-3" /> Draft
                          </span>
                        )}
                        {listing.featured && (
                          <Star className="w-3 h-3 text-amber-500" />
                        )}
                        {listing.is_expired && (
                          <span className="text-xs text-red-500">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {listing.deadline
                          ? format(parseISO(listing.deadline), 'dd MMM yy')
                          : 'â€”'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {listing.views_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/listings/${listing.id}/edit`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Link>
                        <ListingsActions
                          id={listing.id}
                          isPublished={listing.is_published}
                          isFeatured={listing.featured}
                          isExpired={listing.is_expired}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/admin/listings?page=${page - 1}`}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/listings?page=${page + 1}`}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

