import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';
import { NextRequest } from 'next/server';

type RateLimitConfig = {
  requests: number;
  window: `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`;
};

const configs: Record<string, RateLimitConfig> = {
  'process-notice': { requests: 10, window: '1 h' },
  'opportunities': { requests: 100, window: '1 m' },
  'admin-login': { requests: 5, window: '15 m' },
  'auth-otp': { requests: 3, window: '1 m' },
  'default': { requests: 60, window: '1 m' },
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(type: string): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!limiters.has(type)) {
    const config = configs[type] || configs['default'];
    limiters.set(
      type,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        analytics: true,
        prefix: `ratelimit:${type}`,
      })
    );
  }
  return limiters.get(type)!;
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function checkRateLimit(
  request: NextRequest,
  type: string = 'default'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = getLimiter(type);
  if (!limiter) {
    // No Redis configured - allow all requests in dev
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }

  const ip = getClientIp(request);
  const result = await limiter.limit(ip);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function rateLimitResponse(reset: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}
