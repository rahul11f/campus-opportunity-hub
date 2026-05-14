'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-8xl mb-6 select-none"
        >
          🎓
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Looks like this opportunity doesn't exist — or it may have been removed.
            Don't worry, there are plenty more!
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              href="/search"
              className="flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}