import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeEmail(email: string, firstName: string, token: string, ipAddress: string): Promise<void> {
    this.logger.log(`Sending welcome email to ${email}`);
    // Implement your email sending logic here
    // Example: using nodemailer, sendgrid, etc.
  }

  async sendTwoFactorEmail(email: string, firstName: string, code: string, ipAddress: string): Promise<void> {
    this.logger.log(`Sending 2FA email to ${email}`);
    // Implement 2FA email sending logic
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    this.logger.log(`Sending verification email to ${email}`);
    // Implement verification email sending logic
  }
}