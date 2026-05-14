'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Search,
  GraduationCap,
  Menu,
  X,
  LogIn,
  Shield,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'guest' | 'student' | 'admin';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole('guest');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role === 'admin') {
        setRole('admin');
      } else {
        setRole('student');
      }
    }

    loadUser();
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search?type=placement', label: 'Placements' },
    { href: '/search?type=internship', label: 'Internships' },
    { href: '/search?type=hackathon', label: 'Hackathons' },
    { href: '/about', label: 'About' },
    { href: '/support', label: 'Support' },
  ];

  const signoutHref =
    role === 'admin'
      ? '/api/auth/signout?redirect=/admin/login'
      : '/api/auth/signout?redirect=/login';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div>
            <span className="font-bold text-foreground text-sm block">
              Campus Opportunity
            </span>
            <span className="text-[10px] text-muted-foreground uppercase block">
              Hub
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 rounded-lg">
            <Search className="w-4 h-4" />
          </Link>

          {role === 'guest' && (
            <>
              <Link href="/login" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <LogIn className="w-4 h-4" />
                Login
              </Link>

              <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </>
          )}

          {role === 'student' && (
            <>
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <a href={signoutHref} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <LogOut className="w-4 h-4" />
                Sign Out
              </a>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <Shield className="w-4 h-4" />
                Admin
              </Link>

              <a href={signoutHref} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                <LogOut className="w-4 h-4" />
                Sign Out
              </a>
            </>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
