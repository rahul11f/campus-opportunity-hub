'use client';

import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import { Clock } from 'lucide-react';

interface DeadlineCountdownProps {
  deadline: string;
  className?: string;
}

export function DeadlineCountdown({ deadline, className = '' }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    const target = parseISO(deadline);

    function update() {
      const diff = differenceInSeconds(target, new Date());
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
        expired: false,
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) {
    return <div className="skeleton h-8 w-48 rounded" />;
  }

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Application closed</span>
      </div>
    );
  }

  const urgency =
    timeLeft.days < 1
      ? 'text-red-500 dark:text-red-400'
      : timeLeft.days < 3
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Clock className={`w-4 h-4 ${urgency}`} />
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <span className={`font-mono text-sm font-bold ${urgency}`}>
            {timeLeft.days}d
          </span>
        )}
        <span className={`font-mono text-sm font-bold ${urgency}`}>
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span className={`font-mono text-sm font-bold ${urgency}`}>
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        {timeLeft.days === 0 && (
          <span className={`font-mono text-sm font-bold ${urgency}`}>
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        )}
        <span className={`text-xs ${urgency} opacity-75`}>remaining</span>
      </div>
    </div>
  );
}
