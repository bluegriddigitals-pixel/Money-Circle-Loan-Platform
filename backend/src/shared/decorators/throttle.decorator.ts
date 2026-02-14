import { SetMetadata } from '@nestjs/common';

export interface ThrottleOptions {
  ttl?: number;    // Time to live in seconds
  limit?: number;  // Maximum number of requests within TTL
  keyPrefix?: string; // Optional prefix for rate limit key
}

export const THROTTLE_KEY = 'throttle';
export const Throttle = (options: ThrottleOptions) => 
  SetMetadata(THROTTLE_KEY, options);

export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);