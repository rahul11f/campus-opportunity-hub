'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function StudentAuthForm() {
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          alert(error.message);
          return;
        }

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email,
          });

          await supabase
            .from('student_profiles')
            .upsert({
              user_id: data.user.id,
              full_name: fullName,
              email,
            });
        }

        alert('Check email verification.');
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          alert(error.message);
          return;
        }

        window.location.href = '/dashboard';
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Website
      </Link>
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-bold">
            Student Portal
          </h1>

          <p className="text-muted-foreground mt-2">
            Login or create account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 rounded-2xl border"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-2xl border"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-2xl border"
          />

          <button
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-2xl font-semibold"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() =>
            setMode(
              mode === 'login'
                ? 'signup'
                : 'login'
            )
          }
          className="w-full mt-4 text-primary font-medium"
        >
          {mode === 'login'
            ? 'Create new account'
            : 'Already have account? Login'}
        </button>
      </div>
    </div>
  );
}