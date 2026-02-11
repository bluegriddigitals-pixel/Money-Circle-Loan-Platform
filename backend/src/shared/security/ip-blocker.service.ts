import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BlockedIp {
  blockedUntil: Date;
  reason: string;
}

@Injectable()
export class IpBlockerService {
  private readonly logger = new Logger(IpBlockerService.name);
  private readonly blockedIps = new Map<string, BlockedIp>();

  constructor(private readonly configService: ConfigService) {}

  async checkIp(ip: string): Promise<void> {
    const blocked = this.blockedIps.get(ip);
    
    if (blocked && blocked.blockedUntil > new Date()) {
      throw new Error(`IP ${ip} is blocked until ${blocked.blockedUntil}`);
    }

    if (blocked && blocked.blockedUntil <= new Date()) {
      this.blockedIps.delete(ip);
    }
  }

  async blockIp(ip: string, reason: string, durationMinutes: number = 60): Promise<void> {
    const blockedUntil = new Date();
    blockedUntil.setMinutes(blockedUntil.getMinutes() + durationMinutes);

    this.blockedIps.set(ip, {
      blockedUntil,
      reason,
    });

    this.logger.warn(`IP ${ip} blocked until ${blockedUntil}. Reason: ${reason}`);
  }

  async unblockIp(ip: string): Promise<void> {
    this.blockedIps.delete(ip);
    this.logger.log(`IP ${ip} unblocked`);
  }

  async isUnusualLocation(userId: string, ip: string): Promise<boolean> {
    // Implement location checking logic
    return false;
  }
}