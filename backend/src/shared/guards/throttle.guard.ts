import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  HttpException, 
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/roles.decorator';

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly logger = new Logger(ThrottleGuard.name);

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const ttl = rateLimitOptions?.ttl || 60;
    const limit = rateLimitOptions?.limit || 100;
    const key = this.generateKey(request);

    try {
      const result = this.checkRateLimit(key, ttl, limit, response);
      this.setRateLimitHeaders(response, {
        limit,
        remaining: result.remaining,
        reset: Math.ceil(Date.now() / 1000 + ttl),
      });

      request.rateLimit = {
        limit,
        remaining: result.remaining,
        reset: Math.ceil(Date.now() / 1000 + ttl),
      };

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error('Rate limiting error:', error);
      return true;
    }
  }

  private checkRateLimit(key: string, ttl: number, limit: number, response: any): { remaining: number } {
    const now = Date.now();
    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + (ttl * 1000),
      });
      return { remaining: limit - 1 };
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      this.setRateLimitHeaders(response, {
        limit,
        remaining: 0,
        reset: Math.ceil(record.resetTime / 1000),
        retryAfter,
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too Many Requests',
          error: 'Rate limit exceeded',
          retryAfter,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    this.requestCounts.set(key, record);
    return { remaining: limit - record.count };
  }

  private generateKey(request: any): string {
    const ip = request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               request.headers['x-real-ip'] ||
               request.connection?.remoteAddress ||
               request.socket?.remoteAddress ||
               request.ip ||
               'unknown';

    const userId = request.user?.id || 'anonymous';
    const route = request.route?.path || request.url;
    
    return `${userId}:${ip}:${route}`;
  }

  private setRateLimitHeaders(
    response: any, 
    { limit, remaining, reset, retryAfter }: { 
      limit: number; 
      remaining: number; 
      reset: number;
      retryAfter?: number;
    }
  ): void {
    response.header('X-RateLimit-Limit', limit);
    response.header('X-RateLimit-Remaining', remaining);
    response.header('X-RateLimit-Reset', reset);
    
    if (retryAfter) {
      response.header('Retry-After', retryAfter);
    }
  }
}

export interface ThrottleOptions {
  ttl?: number;
  limit?: number;
  keyPrefix?: string;
}

export const Throttle = (options: ThrottleOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    return descriptor;
  };
};

export const THROTTLE_SKIP_KEY = 'throttle:skip';
export const SkipThrottle = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(THROTTLE_SKIP_KEY, true, descriptor.value);
    return descriptor;
  };
};