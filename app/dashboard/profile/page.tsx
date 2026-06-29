'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, User, GraduationCap, AlertCircle, Sparkles, Target, BookOpen, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const BRANCHES = [
  'CSE','IT','ECE','EEE','ME','CE','CHE','BIO','MATH','PHY','MBA','MCA','Other',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

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
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32"
    >
      <motion.div variants={itemVariants} className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Student Profile
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Complete your profile to unlock personalized AI matches.
        </p>
      </motion.div>

      {/* Avatar / Account */}
      <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/50 backdrop-blur-xl p-6 shadow-2xl transition-all hover:shadow-primary/5 hover:border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-3xl font-black shadow-inner border-4 border-background shrink-0">
            {(profile.full_name || userEmail)?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{profile.full_name || 'Your Name'}</h2>
            <p className="text-sm text-muted-foreground/80 font-medium">{userEmail}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <Target className="w-3.5 h-3.5" />
              Profile Active
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Eligibility Notice */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 flex gap-4 text-sm md:text-base relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-500 dark:text-blue-400">AI Eligibility Matcher</p>
          <p className="text-muted-foreground">
            Our AI uses your <strong className="text-foreground font-medium">CGPA, Branch, and Batch</strong> to accurately match you with campus drives and off-campus placements.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-background/40 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="w-5 h-5" />
              </div>
              Personal Details
            </h3>
            <div className="space-y-5">
              <Field label="Full Name">
                <input value={profile.full_name || ''} onChange={(e) => set('full_name', e.target.value)} className="modern-input" placeholder="Rahul Kumar" />
              </Field>
              <Field label="Father's Name">
                <input value={profile.father_name || ''} onChange={(e) => set('father_name', e.target.value)} className="modern-input" placeholder="Kumar Singh" />
              </Field>
            </div>
          </motion.div>

          {/* Academic Info */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-background/40 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              Academic Standing
            </h3>
            
            <div className="grid grid-cols-2 gap-5">
              <Field label="Roll Number">
                <input value={profile.university_roll_no || ''} onChange={(e) => set('university_roll_no', e.target.value)} className="modern-input" placeholder="20BCS001" />
              </Field>
              <Field label="Branch">
                <select value={profile.branch || ''} onChange={(e) => set('branch', e.target.value)} className="modern-input">
                  <option value="">Select</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Graduation Year">
                <input value={profile.batch || ''} onChange={(e) => set('batch', e.target.value)} className="modern-input" placeholder="2024" />
              </Field>
              <Field label="CGPA">
                <input value={profile.cgpa || ''} onChange={(e) => set('cgpa', e.target.value)} className="modern-input" placeholder="8.5" type="number" step="0.01" min="0" max="10" />
              </Field>
            </div>
            
            <Field label="Active Backlogs">
              <input value={profile.backlogs || ''} onChange={(e) => set('backlogs', e.target.value)} className="modern-input bg-red-500/5 focus:border-red-500/50" placeholder="0" type="number" min="0" />
            </Field>
          </motion.div>
          
          {/* Detailed Eligibility Info */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-background/40 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl md:col-span-2">
            <h3 className="font-bold text-lg flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Target className="w-5 h-5" />
              </div>
              Extended Eligibility Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Gender">
                <select value={profile.gender || ''} onChange={(e) => set('gender', e.target.value)} className="modern-input">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="10th Marks (%)">
                <input value={profile.tenth_marks || ''} onChange={(e) => set('tenth_marks', e.target.value)} className="modern-input" placeholder="e.g. 85.5" type="number" step="0.01" />
              </Field>
              <Field label="12th / Diploma Marks (%)">
                <input value={profile.twelfth_marks || ''} onChange={(e) => set('twelfth_marks', e.target.value)} className="modern-input" placeholder="e.g. 82.0" type="number" step="0.01" />
              </Field>
            </div>
            
            <Field label="Core Skills (Comma Separated)">
              <input value={profile.skills || ''} onChange={(e) => set('skills', e.target.value)} className="modern-input" placeholder="e.g. React, Python, Java, Machine Learning" />
            </Field>
          </motion.div>
        </div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-foreground text-background font-bold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Save className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{saving ? 'Saving Profile...' : 'Save Changes'}</span>
          </button>
        </motion.div>
      </form>

      <style jsx global>{`
        .modern-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 1rem;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--background) / 0.5);
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }
        .modern-input:focus {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--background));
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
          transform: translateY(-1px);
        }
        .modern-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
