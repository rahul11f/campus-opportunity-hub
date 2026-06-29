'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useTheme } from 'next-themes';
import {
  Search,
  Home,
  Briefcase,
  Trophy,
  PlusCircle,
  LogIn,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="fixed left-[50%] top-[20%] z-[101] w-full max-w-2xl translate-x-[-50%] p-4 shadow-2xl">
        <Command
          className="overflow-hidden rounded-xl border border-white/10 bg-card/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
          loop
        >
          <div className="flex items-center border-b border-white/10 px-3 py-1">
            <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
            <Command.Input
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              placeholder="Type a command or search..."
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Home className="mr-3 h-4 w-4" />
                <span>Home</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/search'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Briefcase className="mr-3 h-4 w-4" />
                <span>Search Opportunities</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/leaderboard'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Trophy className="mr-3 h-4 w-4" />
                <span>Leaderboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/contribute'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <PlusCircle className="mr-3 h-4 w-4" />
                <span>Contribute</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Theme" className="px-2 mt-4 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => runCommand(() => setTheme('light'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Sun className="mr-3 h-4 w-4" />
                <span>Light Mode</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme('dark'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Moon className="mr-3 h-4 w-4" />
                <span>Dark Mode</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme('system'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <Laptop className="mr-3 h-4 w-4" />
                <span>System Theme</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Account" className="px-2 mt-4 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/login'))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground transition-colors"
              >
                <LogIn className="mr-3 h-4 w-4" />
                <span>Login to Portal</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[100]" onClick={() => setOpen(false)} />
    </div>
  );
}
