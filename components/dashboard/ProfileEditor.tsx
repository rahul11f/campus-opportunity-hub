'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
  initialName: string;
  initialEmail: string;
}

export default function ProfileEditor({
  userId,
  initialName,
  initialEmail,
}: Props) {
  const [fullName, setFullName] = useState(initialName || '');
  const [fatherName, setFatherName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [backlogs, setBacklogs] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data) return;

      setFatherName(data.father_name || '');
      setRollNo(data.university_roll_no || '');
      setBranch(data.branch || '');
      setBatch(data.batch || '');
      setCgpa(data.cgpa || '');
      setBacklogs(data.backlogs || '');
    }

    loadProfile();
  }, [userId]);

  async function saveProfile() {
    setSaving(true);

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          email: initialEmail,
        });

      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      const { error: studentError } = await supabase
        .from('student_profiles')
        .upsert(
          {
            user_id: userId,
            full_name: fullName,
            father_name: fatherName,
            university_roll_no: rollNo,
            branch,
            batch,
            cgpa,
            backlogs,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (studentError) {
        toast.error(studentError.message);
        return;
      }

      toast.success('Profile saved successfully');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-5">
        Student Profile
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Father Name" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="University Roll No" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Batch" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="CGPA" className="px-4 py-3 rounded-xl border bg-background" />
        <input value={backlogs} onChange={(e) => setBacklogs(e.target.value)} placeholder="Backlogs" className="px-4 py-3 rounded-xl border bg-background md:col-span-2" />
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground"
      >
        <Save className="w-4 h-4 inline mr-2" />
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
