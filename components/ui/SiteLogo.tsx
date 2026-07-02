'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

interface SiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function SiteLogo({ className = '', size = 'md', isLoading = false }: SiteLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8 rounded-xl',
      icon: 'w-4 h-4',
      sparkle: 'w-2 h-2',
      text: 'text-sm',
    },
    md: {
      container: 'w-10 h-10 rounded-2xl',
      icon: 'w-5 h-5',
      sparkle: 'w-3 h-3',
      text: 'text-base',
    },
    lg: {
      container: 'w-16 h-16 rounded-[24px]',
      icon: 'w-8 h-8',
      sparkle: 'w-5 h-5',
      text: 'text-2xl',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Dynamic Animated Outer Ring / Aura */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 ${currentSize.container} opacity-30 blur-[6px] -z-10`}
        animate={
          isLoading
            ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }
            : { scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }
        }
        transition={{
          duration: isLoading ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Rotating Border for Loading State */}
      <div className={`absolute -inset-[2px] ${currentSize.container} overflow-hidden -z-10`}>
        <motion.div
          className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_40%,#2563eb_70%,#a855f7_100%)]"
          animate={{ rotate: 360 }}
          transition={{
            duration: isLoading ? 1.2 : 6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Mask to create border effect */}
        <div className={`absolute inset-[2px] bg-background ${currentSize.container} -z-10`} />
      </div>

      {/* Main Core Container */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 border border-white/20 shadow-lg ${currentSize.container}`}>
        {/* Animated Inner Cap */}
        <motion.div
          animate={
            isLoading
              ? { rotate: [0, -10, 10, 0], scale: [1, 0.9, 1.1, 1] }
              : { y: [0, -2, 0] }
          }
          transition={{
            duration: isLoading ? 1.2 : 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <GraduationCap className={`${currentSize.icon} text-white`} />
        </motion.div>

        {/* Small floating sparkle */}
        <motion.div
          className={`absolute -top-1 -right-1 text-yellow-300 drop-shadow`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 45, 90, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className={currentSize.sparkle} />
        </motion.div>
      </div>
    </div>
  );
}
