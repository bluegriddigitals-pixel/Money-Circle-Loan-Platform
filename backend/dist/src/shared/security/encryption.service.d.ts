import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly configService;
    private readonly logger;
    private readonly algorithm;
    private readonly secretKey;
    private readonly ivLength;
    private readonly saltLength;
    constructor(configService: ConfigService);
    encrypt(text: string): Promise<string>;
    decrypt(encryptedData: string): Promise<string>;
    hash(data: string): Promise<string>;
    compareHash(data: string, hash: string): Promise<boolean>;
}
