import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendWelcomeEmail(email: string): Promise<void>;
    sendTwoFactorEmail(email: string): Promise<void>;
    sendVerificationEmail(email: string): Promise<void>;
}
