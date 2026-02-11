import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;
  private readonly ivLength = 16;
  private readonly saltLength = 64;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get('ENCRYPTION_KEY');
    this.secretKey = crypto.scryptSync(key, 'salt', 32);
  }

  async encrypt(text: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const salt = crypto.randomBytes(this.saltLength);
    
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  async decrypt(encryptedData: string): Promise<string> {
    const [saltHex, ivHex, authTagHex, encryptedHex] = encryptedData.split(':');

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  async hash(data: string): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  async compareHash(data: string, hash: string): Promise<boolean> {
    const hashedData = await this.hash(data);
    return hashedData === hash;
  }
}