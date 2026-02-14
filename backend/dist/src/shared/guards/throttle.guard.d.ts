import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
export declare class ThrottleGuard implements CanActivate {
    private reflector;
    private configService;
    private readonly requestCounts;
    private readonly logger;
    constructor(reflector: Reflector, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkRateLimit;
    private generateKey;
    private setRateLimitHeaders;
}
export interface ThrottleOptions {
    ttl?: number;
    limit?: number;
    keyPrefix?: string;
}
export declare const Throttle: (options: ThrottleOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const THROTTLE_SKIP_KEY = "throttle:skip";
export declare const SkipThrottle: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
