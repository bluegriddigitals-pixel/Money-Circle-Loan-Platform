import { ConfigService } from '@nestjs/config';
export declare class RateLimiterService {
    private readonly configService;
    private readonly logger;
    private readonly store;
    constructor(configService: ConfigService);
    checkLimit(key: string, limit: number, windowSeconds: number): Promise<void>;
    clearKey(key: string): Promise<void>;
}
