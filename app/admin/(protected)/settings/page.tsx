'use client';

import { useState, useEffect } from 'react';
import { Save, ShieldCheck, Mail, Globe, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Campus Opportunity Hub',
    contactEmail: 'admin@campusopportunityhub.in',
    enableStudentContributions: true,
    requireAdminApproval: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    enableAds: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(s => ({
            ...s,
            siteName: data.siteName || s.siteName,
            contactEmail: data.contactEmail || s.contactEmail,
            enableStudentContributions: data.enableStudentContributions ?? s.enableStudentContributions,
            requireAdminApproval: data.requireAdminApproval ?? s.requireAdminApproval,
            enableEmailNotifications: data.enableEmailNotifications ?? s.enableEmailNotifications,
            maintenanceMode: data.maintenanceMode ?? s.maintenanceMode,
            enableAds: data.enableAds ?? s.enableAds,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    localStorage.setItem('admin_ads_enabled', String(settings.enableAds));
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Settings saved to database');
      } else {
        toast.error('Failed to save settings to database');
      }
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure platform-wide settings and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="admin-card rounded-xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-6">
            <Globe className="w-5 h-5 text-blue-600" />
            General Info
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Platform Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-950 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-950 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="admin-card rounded-xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-6">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Security & Access
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-950">Enable Student Contributions</p>
                <p className="text-xs text-slate-500 mt-0.5">Allow students to submit new opportunities from dashboard.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.enableStudentContributions} onChange={e => setSettings({ ...settings, enableStudentContributions: e.target.checked })} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.enableStudentContributions ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enableStudentContributions ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-950">Require Admin Approval</p>
                <p className="text-xs text-slate-500 mt-0.5">Submitted opportunities go to drafts first.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.requireAdminApproval} onChange={e => setSettings({ ...settings, requireAdminApproval: e.target.checked })} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.requireAdminApproval ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.requireAdminApproval ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-950">Enable Google AdSense</p>
                <p className="text-xs text-slate-500 mt-0.5">Show ads minimally across the platform.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.enableAds} onChange={e => setSettings({ ...settings, enableAds: e.target.checked })} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.enableAds ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enableAds ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
              <div>
                <p className="text-sm font-medium text-red-600">Maintenance Mode</p>
                <p className="text-xs text-red-500 mt-0.5">Disable access to the public student portal.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
