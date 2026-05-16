import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Building2,
  Linkedin,
  Github,
  Instagram,
  Twitter,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Link
              href="/"
              className="flex items-center gap-3 mb-5"
            >
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>

              <div>
                <span className="font-bold block">
                  Campus Opportunity Hub
                </span>
                <span className="text-xs text-muted-foreground">
                  Student-first platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Placements, internships, academic notices,
              results, deadlines, eligibility tools,
              and student productivity in one unified platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Opportunities
            </h4>

            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/search" className="block">All Opportunities</Link>
              <Link href="/search?type=placement" className="block">Placements</Link>
              <Link href="/search?type=internship" className="block">Internships</Link>
              <Link href="/leaderboard" className="block">Leaderboard</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Company
            </h4>

            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/about" className="block">About</Link>
              <Link href="/support" className="block">Support</Link>
              <Link href="/privacy" className="block">Privacy Policy</Link>
              <Link href="/terms" className="block">Terms of Use</Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">
                Connect
              </h4>
            </div>

            <div className="flex justify-center md:justify-start gap-3 mb-5">
              <a href="#" className="p-2 border rounded-xl hover:bg-accent">
                <Linkedin className="w-4 h-4" />
              </a>

              <a href="#" className="p-2 border rounded-xl hover:bg-accent">
                <Github className="w-4 h-4" />
              </a>

              <a href="#" className="p-2 border rounded-xl hover:bg-accent">
                <Instagram className="w-4 h-4" />
              </a>

              <a href="#" className="p-2 border rounded-xl hover:bg-accent">
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            <a
              href="mailto:hello@campusopportunityhub.in"
              className="flex items-center justify-center md:justify-start gap-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              hello@campusopportunityhub.in
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground text-center">
          <span>
            © {new Date().getFullYear()} Campus Opportunity Hub
          </span>

          <span>
            Built for students • Next.js + Supabase
          </span>
        </div>
      </div>
    </footer>
  );
}
