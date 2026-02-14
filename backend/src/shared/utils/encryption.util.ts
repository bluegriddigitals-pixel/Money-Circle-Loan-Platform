import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export class EncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;
  private static readonly ITERATIONS = 100000;
  private static readonly DIGEST = 'sha256';

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a random secure token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a random numeric code (for OTP, verification)
   */
  static generateNumericCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encrypt(text: string, secretKey: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const key = this.deriveKey(secretKey, salt);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    return result.toString('base64');
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(encryptedData: string, secretKey: string): string {
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.subarray(0, this.SALT_LENGTH);
    const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    const tag = data.subarray(
      this.SALT_LENGTH + this.IV_LENGTH,
      this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH,
    );
    const encrypted = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

    const key = this.deriveKey(secretKey, salt);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Create a hash of data using SHA-256
   */
  static createHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a HMAC signature
   */
  static createHmac(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Generate a random UUID
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Encrypt sensitive data for storage (like API keys, secrets)
   */
  static encryptSensitive(data: string, encryptionKey: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitive(encryptedData: string, encryptionKey: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Derive a key using PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST,
    );
  }

  /**
   * Generate a key pair for asymmetric encryption
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  /**
   * Mask sensitive data (like credit card numbers, emails)
   */
  static maskData(data: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (data.length <= visibleChars) {
      return maskChar.repeat(data.length);
    }
    const visiblePart = data.slice(-visibleChars);
    const maskedPart = maskChar.repeat(data.length - visibleChars);
    return maskedPart + visiblePart;
  }

  /**
   * Generate a secure comparison of two strings (timing safe)
   */
  static secureCompare(str1: string, str2: string): boolean {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(str1),
        Buffer.from(str2)
      );
    } catch {
      return false;
    }
  }
}