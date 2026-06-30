'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Link as LinkIcon, Image as ImageIcon, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AdCampaign = {
  id: string;
  title: string;
  image_url: string;
  link: string;
  status: string;
  views: number;
  clicks: number;
  created_at: string;
};

export default function AdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    try {
      const res = await fetch('/api/admin/ads');
      if (!res.ok) throw new Error('Failed to fetch ads. Make sure ads_campaigns table exists.');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, image_url: imageUrl, link })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create ad');
      }
      toast.success('Ad campaign created!');
      setShowModal(false);
      setTitle('');
      setImageUrl('');
      setLink('');
      fetchAds();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ad campaign?')) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Ad deleted');
      setAds(ads.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ads Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform advertisements and sponsored listings.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Ad Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Active Campaigns</p>
          <p className="text-3xl font-bold text-slate-900">{ads.length}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Total Ad Views</p>
          <p className="text-3xl font-bold text-slate-900">{ads.reduce((sum, ad) => sum + (ad.views || 0), 0)}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Total Clicks</p>
          <p className="text-3xl font-bold text-blue-600">{ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading campaigns...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="admin-card rounded-xl overflow-hidden p-16 flex flex-col items-center justify-center text-center border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No active advertisements</h3>
          <p className="text-slate-500 max-w-sm mb-6">Create your first ad campaign to display sponsored content to students on the platform.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-medium transition-colors border border-slate-200"
          >
            <Plus className="w-4 h-4" /> Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="admin-card rounded-xl overflow-hidden border border-slate-200 group flex flex-col">
              <div className="aspect-video w-full bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={ad.link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur-sm transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button onClick={() => handleDelete(ad.id)} className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center text-white backdrop-blur-sm transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{ad.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-1">{ad.link}</p>
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Views</p>
                    <p className="font-semibold text-slate-700">{ad.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Clicks</p>
                    <p className="font-semibold text-slate-700">{ad.clicks || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 relative z-10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">New Campaign</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Campaign Title</label>
                <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-slate-900 text-sm" placeholder="e.g. Summer Internship Bootcamp" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Image URL</label>
                <input required value={imageUrl} onChange={e=>setImageUrl(e.target.value)} type="url" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-slate-900 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> Destination Link</label>
                <input required value={link} onChange={e=>setLink(e.target.value)} type="url" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-slate-900 text-sm" placeholder="https://..." />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
