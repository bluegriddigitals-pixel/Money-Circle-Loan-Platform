import { ConfigService } from '@nestjs/config';
export declare class IpBlockerService {
    private readonly configService;
    private readonly logger;
    private readonly blockedIps;
    constructor(configService: ConfigService);
    checkIp(ip: string): Promise<void>;
    blockIp(ip: string, reason: string, durationMinutes?: number): Promise<void>;
    unblockIp(ip: string): Promise<void>;
    isUnusualLocation(userId: string, ip: string): Promise<boolean>;
}
