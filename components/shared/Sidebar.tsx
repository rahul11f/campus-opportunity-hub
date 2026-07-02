'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  Trophy,
  PlusCircle,
  LogIn,
  User,
  Settings,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { SiteLogo } from '@/components/ui/SiteLogo';

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<'guest' | 'student' | 'admin'>('guest');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setRole(data?.role === 'admin' ? 'admin' : 'student');
    }
    loadUser();
  }, []);

  const NAV = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Opportunities', icon: Briefcase },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/contribute', label: 'Contribute', icon: PlusCircle },
  ];

  if (!mounted) return null;

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-border bg-background/50 backdrop-blur-xl z-40 p-4">
      
      {/* Premium Logo */}
      <Link href="/" className="group flex items-center gap-3 px-2 py-4 mb-6 relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        <SiteLogo size="md" />
        <div className="relative">
          <h1 className="text-sm font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight max-w-[150px]">
            Campus Opportunity Hub
          </h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Premium Access</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Main Menu</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group overflow-hidden ${
                isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-4 pt-4 border-t border-border">
        {role === 'guest' ? (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-foreground to-foreground/80 text-background font-bold hover:shadow-lg hover:shadow-foreground/20 hover:-translate-y-0.5 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Login to Portal</span>
          </Link>
        ) : (
          <Link
            href={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-all border border-primary/20"
          >
            <User className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Link>
        )}
        
        <div className="flex items-center justify-between px-3">
          <span className="text-xs font-medium text-muted-foreground">Theme Preference</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
