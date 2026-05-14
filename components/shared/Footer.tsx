import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Send,
} from 'lucide-react';
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">
                Campus Opportunity Hub
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              AI-powered platform transforming raw campus recruitment notices into clean,
              structured opportunity listings for students across India.
            </p>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed border-l-2 border-border pl-3">
              Disclaimer: This is an independent informational platform. Always verify
              official opportunity details before applying.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Opportunities
            </h4>

            <ul className="space-y-2">
              {[
                { label: 'Placements', href: '/search?type=placement' },
                { label: 'Internships', href: '/search?type=internship' },
                { label: 'Hackathons', href: '/search?type=hackathon' },
                { label: 'Scholarships', href: '/search?type=scholarship' },
                { label: 'All Opportunities', href: '/search' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Platform
            </h4>

            <ul className="space-y-2">
              {[
                { label: 'About', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Use', href: '/terms' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Support', href: '/support' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 mt-6 flex-wrap">
  {[
    { href: 'mailto:hello@campusopportunityhub.in', icon: Mail, label: 'Email' },
    { href: '#', icon: Linkedin, label: 'LinkedIn' },
    { href: '#', icon: Twitter, label: 'X / Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Youtube, label: 'YouTube' },
    { href: '#', icon: Github, label: 'GitHub' },
    { href: '#', icon: Send, label: 'Telegram' },
  ].map(({ href, icon: Icon, label }) => (
    <a
      key={label}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </a>
  ))}
</div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Campus Opportunity Hub
          </p>

          <p className="text-xs text-muted-foreground">
            Powered by Gemini AI · Supabase · Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
