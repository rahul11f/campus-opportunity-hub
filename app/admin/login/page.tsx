'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LoginSchema } from '@/lib/validators';

function isAdminEmail(email: string) {
  const adminEmails = (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL_WHITELIST || ''
  )
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email);
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isUnauthorized =
    searchParams.get('error') === 'unauthorized';

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setError('');

    const parsed = LoginSchema.safeParse({
      email,
      password,
    });

    if (!parsed.success) {
      setError(
        parsed.error.errors[0].message
      );
      return;
    }

    if (!isAdminEmail(email)) {
      setError(
        'Not authorized for admin access.'
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError(
        'Unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Website
      </Link>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold">
            Admin Login
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Campus Opportunity Hub
          </p>
        </div>

        {(error || isUnauthorized) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              {isUnauthorized
                ? 'Unauthorized.'
                : error}
            </p>
          </div>
        )}

        <div className="bg-card border rounded-2xl p-6">
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              required
              className="w-full px-3 py-2.5 border rounded-xl"
            />

            <div className="relative">
              <input
                type={
                  showPass
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                required
                className="w-full px-3 py-2.5 border rounded-xl pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPass(!showPass)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-semibold"
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}