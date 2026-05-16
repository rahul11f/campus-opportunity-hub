'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trash2,
  Star,
  StarOff,
  Clock3,
  Pencil,
  Rocket,
  Ban,
} from 'lucide-react';
import Link from 'next/link';

interface ListingsActionsProps {
  id: string;
  isPublished: boolean;
  isFeatured: boolean;
  isExpired: boolean;
}

export function ListingsActions({
  id,
  isPublished,
  isFeatured,
  isExpired,
}: ListingsActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (
    body: Record<string, unknown>,
    label: string
  ) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Update failed');
      }

      toast.success(label);
      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Action failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete permanently?')) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Deleted');
      router.refresh();
    } catch {
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/edit-listing/${id}`}
        className="px-3 py-2 rounded-xl border text-sm flex items-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        Edit
      </Link>

      {!isPublished ? (
        <button
          disabled={loading}
          onClick={() =>
            patch(
              {
                is_published: true,
                is_expired: false,
              },
              'Published'
            )
          }
          className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Publish
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={() =>
            patch(
              {
                is_published: false,
              },
              'Unpublished'
            )
          }
          className="px-3 py-2 rounded-xl bg-yellow-600 text-white text-sm flex items-center gap-2"
        >
          <Ban className="w-4 h-4" />
          Unpublish
        </button>
      )}

      {!isExpired && (
        <button
          disabled={loading}
          onClick={() =>
            patch(
              {
                is_expired: true,
                is_published: false,
              },
              'Expired'
            )
          }
          className="px-3 py-2 rounded-xl border text-sm flex items-center gap-2"
        >
          <Clock3 className="w-4 h-4" />
          Expire
        </button>
      )}

      <button
        disabled={loading}
        onClick={() =>
          patch(
            {
              featured: !isFeatured,
            },
            isFeatured
              ? 'Unfeatured'
              : 'Featured'
          )
        }
        className="px-3 py-2 rounded-xl border text-sm"
      >
        {isFeatured ? (
          <StarOff className="w-4 h-4" />
        ) : (
          <Star className="w-4 h-4" />
        )}
      </button>

      <button
        disabled={loading}
        onClick={remove}
        className="px-3 py-2 rounded-xl bg-red-600 text-white"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
