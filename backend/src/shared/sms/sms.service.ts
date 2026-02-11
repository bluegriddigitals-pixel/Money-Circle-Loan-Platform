import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    this.logger.log(`Sending verification code to ${phoneNumber}: ${code}`);
    // Implement SMS sending logic here
    // Example: using Twilio, AWS SNS, etc.
  }

  async sendTwoFactorCode(phoneNumber: string, code: string): Promise<void> {
    this.logger.log(`Sending 2FA code to ${phoneNumber}: ${code}`);
    // Implement 2FA SMS sending logic
  }
}