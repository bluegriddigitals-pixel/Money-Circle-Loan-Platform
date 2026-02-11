import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitEntry {
  attempts: number;
  resetTime: Date;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(private readonly configService: ConfigService) {}

  async checkLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
    const now = new Date();
    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, {
        attempts: 1,
        resetTime: new Date(now.getTime() + windowSeconds * 1000),
      });
      return;
    }

    if (entry.resetTime < now) {
      this.store.set(key, {
        attempts: 1,
        resetTime: new Date(now.getTime() + windowSeconds * 1000),
      });
      return;
    }

    if (entry.attempts >= limit) {
      throw new Error('Rate limit exceeded');
    }

    entry.attempts += 1;
    this.store.set(key, entry);
  }

  async clearKey(key: string): Promise<void> {
    this.store.delete(key);
  }
}