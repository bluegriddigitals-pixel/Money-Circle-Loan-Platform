export interface ThrottleOptions {
    ttl?: number;
    limit?: number;
    keyPrefix?: string;
}
export declare const THROTTLE_KEY = "throttle";
export declare const Throttle: (options: ThrottleOptions) => import("@nestjs/common").CustomDecorator<string>;
export declare const SKIP_THROTTLE_KEY = "skipThrottle";
export declare const SkipThrottle: () => import("@nestjs/common").CustomDecorator<string>;
