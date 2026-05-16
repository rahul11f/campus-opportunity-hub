import Link from 'next/link';
import {
  Trophy,
  Briefcase,
  LogIn,
  Shield,
  PlusCircle,
} from 'lucide-react';

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold"
        >
          Campus Opportunity Hub
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/opportunities"
            className="hover:text-primary flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Opportunities
          </Link>

          <Link
            href="/leaderboard"
            className="hover:text-primary flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>

          <Link
            href="/login"
            className="hover:text-primary flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Contribute
          </Link>

          <Link
            href="/admin/login"
            className="hover:text-primary flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        </nav>

        <Link
          href="/login"
          className="px-5 py-3 rounded-2xl bg-primary text-white font-semibold flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Student Login
        </Link>
      </div>
    </header>
  );
}