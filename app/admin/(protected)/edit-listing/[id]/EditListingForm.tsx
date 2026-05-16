'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function EditListingForm({
  listing,
}: {
  listing: any;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    company: listing.company || '',
    role: listing.role || '',
    type: listing.type || '',
    deadline: listing.deadline || '',
    instructions: listing.instructions || '',
    source_link: listing.source_link || '',
  });

  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    try {
      const res = await fetch(`/api/opportunities/${listing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Update failed');
      }

      toast.success('Listing updated');
      router.push('/admin/listings');
      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Save failed'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">
        Edit Listing
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <input value={form.company} onChange={(e)=>setForm({...form,company:e.target.value})} placeholder="Company" className="border rounded-2xl p-4 bg-card" />
        <input value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} placeholder="Role" className="border rounded-2xl p-4 bg-card" />
        <input value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} placeholder="Type" className="border rounded-2xl p-4 bg-card" />
        <input value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} placeholder="Deadline" className="border rounded-2xl p-4 bg-card" />
        <input value={form.source_link} onChange={(e)=>setForm({...form,source_link:e.target.value})} placeholder="Source URL" className="border rounded-2xl p-4 bg-card md:col-span-2" />
        <textarea rows={10} value={form.instructions} onChange={(e)=>setForm({...form,instructions:e.target.value})} placeholder="Instructions" className="border rounded-2xl p-4 bg-card md:col-span-2" />
      </div>

      <button
        disabled={saving}
        onClick={save}
        className="px-6 py-4 rounded-2xl bg-primary text-white font-semibold"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}