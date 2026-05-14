'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, MoreHorizontal } from 'lucide-react';

interface ListingsActionsProps {
  id: string;
  isPublished: boolean;
  isFeatured: boolean;
  isExpired: boolean;
}

export function ListingsActions({ id, isPublished, isFeatured, isExpired }: ListingsActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (body: Record<string, unknown>, label: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(label);
      router.refresh();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Listing deleted.');
      router.refresh();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => patch({ is_published: !isPublished }, isPublished ? 'Unpublished' : 'Published')}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <span className="text-muted-foreground/30">Â·</span>
      <button
        onClick={() => patch({ featured: !isFeatured }, isFeatured ? 'Unfeatured' : 'Featured!')}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-amber-500 transition-colors disabled:opacity-50"
      >
        {isFeatured ? 'â˜…' : 'â˜†'}
      </button>
      <span className="text-muted-foreground/30">Â·</span>
      {!isExpired && (
        <>
          <button
            onClick={() => patch({ is_expired: true }, 'Marked as expired')}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
          >
            Expire
          </button>
          <span className="text-muted-foreground/30">Â·</span>
        </>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

