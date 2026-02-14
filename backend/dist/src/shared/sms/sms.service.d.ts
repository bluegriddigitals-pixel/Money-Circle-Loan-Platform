import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
    sendTwoFactorCode(phoneNumber: string, code: string): Promise<void>;
}
