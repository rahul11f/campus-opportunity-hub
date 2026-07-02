import Link from 'next/link';
import {
  Sparkles,
  Mail,
  Building2,
  Linkedin,
  Github,
  Instagram,
  Twitter,
} from 'lucide-react';

import { SiteLogo } from '@/components/ui/SiteLogo';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-background overflow-hidden mt-12">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="group flex flex-col items-center gap-3 mb-4">
            <SiteLogo size="md" />
            <div>
              <span className="text-xl font-black tracking-tight block bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Campus Opportunity Hub
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-0.5 block">
                Premium Student Network
              </span>
            </div>
          </Link>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            The definitive platform for campus placements, internships, hackathons, and scholarships. Built for students, verified by community.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} />
            <SocialLink href="#" icon={<Github className="w-4 h-4" />} />
            <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} />
            <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto border-t border-white/5 pt-8">
          
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-xs">Platform</h4>
            <div className="space-y-2.5 text-xs font-medium text-muted-foreground flex flex-col items-center">
              <FooterLink href="/search">Explore Jobs</FooterLink>
              <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              <FooterLink href="/contribute">Contribute</FooterLink>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-xs">Categories</h4>
            <div className="space-y-2.5 text-xs font-medium text-muted-foreground flex flex-col items-center">
              <FooterLink href="/search?type=placement">Placements</FooterLink>
              <FooterLink href="/search?type=internship">Internships</FooterLink>
              <FooterLink href="/search?type=hackathon">Hackathons</FooterLink>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-xs">Company</h4>
            <div className="space-y-2.5 text-xs font-medium text-muted-foreground flex flex-col items-center">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/support">Help Center</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-xs">Legal</h4>
            <div className="space-y-2.5 text-xs font-medium text-muted-foreground flex flex-col items-center">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookie-policy">Cookie Policy</FooterLink>
            </div>
          </div>

        </div>

        <div className="mt-10 text-center text-[11px] text-muted-foreground flex flex-col md:flex-row items-center justify-center gap-2 border-t border-white/5 pt-6">
          <Building2 className="w-4 h-4" />
          <p>© {new Date().getFullYear()} Campus Opportunity Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-foreground hover:underline decoration-primary/50 underline-offset-4 transition-all">
      {children}
    </Link>
  );
}
