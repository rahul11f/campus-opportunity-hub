'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, PlusCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Briefcase },
    { name: 'Post', href: '/contribute', icon: PlusCircle },
    { name: 'Profile', href: '/dashboard', icon: User },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pb-safe pointer-events-none">
      <nav className="flex justify-around items-center h-16 w-full max-w-[320px] bg-background/80 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl pointer-events-auto overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full group ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-5 h-5 z-10 transition-transform ${isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-2 group-hover:scale-110'}`} />
              <span className={`text-[9px] font-medium mt-1 z-10 transition-colors ${isActive ? 'font-bold text-primary' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
