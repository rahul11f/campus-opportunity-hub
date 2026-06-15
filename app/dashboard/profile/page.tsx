'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, User, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

const BRANCHES = [
  'CSE','IT','ECE','EEE','ME','CE','CHE','BIO','MATH','PHY','MBA','MCA','Other',
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const supabase = useRef(createClient());

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.current.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || '');

      const { data } = await supabase.current
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(data || { user_id: user.id });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.current.auth.getUser();
    if (!user) { setSaving(false); return; }

    const upsertData = {
      ...profile,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.current
      .from('student_profiles')
      .upsert(upsertData, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to save profile: ' + error.message);
    } else {
      toast.success('Profile saved successfully!');
    }
    setSaving(false);
  }

  function set(key: string, value: string) {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Keep your profile updated for accurate AI eligibility checks
        </p>
      </div>

      {/* Avatar / Account */}
      <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
          {(profile.full_name || userEmail)?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <div>
          <p className="font-semibold">{profile.full_name || 'Your Name'}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
      </div>

      {/* AI Eligibility Notice */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3 text-sm">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          Your profile is used for <strong className="text-foreground">AI Eligibility checks</strong>.
          Keep CGPA, branch, and batch accurate to get correct results.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal Info */}
        <Section title="Personal Info" icon={<User className="w-4 h-4" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name" placeholder="Your full name">
              <input value={profile.full_name || ''} onChange={(e) => set('full_name', e.target.value)} className="input" placeholder="Rahul Kumar" />
            </Field>
            <Field label="Father's Name" placeholder="Father's name">
              <input value={profile.father_name || ''} onChange={(e) => set('father_name', e.target.value)} className="input" placeholder="Kumar Singh" />
            </Field>
          </div>
        </Section>

        {/* Academic Info */}
        <Section title="Academic Details" icon={<GraduationCap className="w-4 h-4" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="University Roll No.">
              <input value={profile.university_roll_no || ''} onChange={(e) => set('university_roll_no', e.target.value)} className="input" placeholder="20BCS001" />
            </Field>
            <Field label="Branch">
              <select value={profile.branch || ''} onChange={(e) => set('branch', e.target.value)} className="input">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Batch / Graduation Year">
              <input value={profile.batch || ''} onChange={(e) => set('batch', e.target.value)} className="input" placeholder="2024" />
            </Field>
            <Field label="CGPA">
              <input value={profile.cgpa || ''} onChange={(e) => set('cgpa', e.target.value)} className="input" placeholder="8.5" type="number" step="0.01" min="0" max="10" />
            </Field>
          </div>
          <Field label="Active Backlogs">
            <input value={profile.backlogs || ''} onChange={(e) => set('backlogs', e.target.value)} className="input" placeholder="0" type="number" min="0" />
          </Field>
        </Section>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children, placeholder }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}
