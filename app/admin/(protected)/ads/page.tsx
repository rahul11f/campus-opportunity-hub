import { Megaphone, Plus, BarChart3, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform advertisements and sponsored listings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 shrink-0">
          <Plus className="w-4 h-4" />
          Create Ad Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Active Campaigns</p>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Total Ad Views</p>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Total Clicks</p>
          <p className="text-3xl font-bold text-blue-400">0</p>
        </div>
      </div>

      <div className="admin-card rounded-xl overflow-hidden p-16 flex flex-col items-center justify-center text-center border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Megaphone className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No active advertisements</h3>
        <p className="text-gray-400 max-w-sm mb-6">Create your first ad campaign to display sponsored content to students on the platform.</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
          <Plus className="w-4 h-4" /> Get Started
        </button>
      </div>
    </div>
  );
}
