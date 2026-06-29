'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Github, Linkedin, Sparkles, Mail, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'otp';

export function StudentAuthForm() {
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(email)) errors.email = 'Invalid email address';
    
    if (mode === 'login' || mode === 'signup') {
      if (!password) errors.password = 'Password is required';
      else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleOAuthLogin(provider: 'google' | 'linkedin_oidc' | 'github') {
    setLoading(true);
    setFieldErrors({});
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setFieldErrors({ general: err.message || 'OAuth login failed' });
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setFieldErrors({});

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setFieldErrors({ general: error.message });
          return;
        }
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, email });
          await supabase.from('student_profiles').upsert({ user_id: data.user.id, full_name: fullName, email });
        }
        toast.success('Check your email for the verification link.');
      } 
      else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('password')) setFieldErrors({ password: 'Invalid password' });
          else setFieldErrors({ general: error.message });
          return;
        }
        window.location.href = '/dashboard';
      }
      else if (mode === 'otp') {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (error) {
          setFieldErrors({ general: error.message });
          return;
        }
        toast.success('Magic link sent to your email!');
      }
      else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });
        if (error) {
          setFieldErrors({ general: error.message });
          return;
        }
        toast.success('Password reset link sent to your email!');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative py-12">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Website
      </Link>
      
      <div className="w-full max-w-md rounded-[2rem] border bg-card/50 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)] border border-white/20 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : mode === 'otp' ? 'Magic Link' : 'Reset Password'}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {mode === 'login' || mode === 'signup' 
              ? 'Join the premium campus network' 
              : mode === 'otp' 
                ? 'Sign in securely without a password' 
                : 'We will send you a reset link'}
          </p>
        </div>

        {fieldErrors.general && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center justify-center text-center">
            {fieldErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors({ ...fieldErrors, email: undefined, general: undefined });
                }}
                className={`w-full pl-4 pr-10 py-3.5 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none ${fieldErrors.email ? 'border-destructive focus:ring-destructive/50' : ''}`}
                placeholder="you@university.edu"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {fieldErrors.email && <p className="text-destructive text-xs font-bold ml-1 mt-1">{fieldErrors.email}</p>}
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot-password'); setFieldErrors({}); }} className="text-xs font-bold text-primary hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors({ ...fieldErrors, password: undefined, general: undefined });
                  }}
                  className={`w-full pl-4 pr-10 py-3.5 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none ${fieldErrors.password ? 'border-destructive focus:ring-destructive/50' : ''}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {fieldErrors.password && <p className="text-destructive text-xs font-bold ml-1 mt-1">{fieldErrors.password}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 rounded-xl bg-foreground text-background font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'otp' ? 'Send Magic Link' : 'Send Reset Link'}
          </button>
        </form>

        {(mode === 'login' || mode === 'signup') && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border bg-background/50 hover:bg-muted font-semibold text-sm transition-all shadow-sm"
              >
                <GoogleIcon /> Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border bg-background/50 hover:bg-muted font-semibold text-sm transition-all shadow-sm"
              >
                <Github className="w-5 h-5" /> GitHub
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground flex flex-col gap-2">
          {mode === 'login' ? (
            <>
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setFieldErrors({}); }} className="text-foreground font-bold hover:underline decoration-primary">
                  Sign up
                </button>
              </p>
              <button type="button" onClick={() => { setMode('otp'); setFieldErrors({}); }} className="text-primary font-bold hover:underline flex items-center justify-center gap-1 mx-auto mt-2">
                <KeyRound className="w-4 h-4" /> Login with Magic Link
              </button>
            </>
          ) : (
            <p>
              Back to{' '}
              <button type="button" onClick={() => { setMode('login'); setFieldErrors({}); }} className="text-foreground font-bold hover:underline decoration-primary">
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}