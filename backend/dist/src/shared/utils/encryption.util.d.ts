export declare class EncryptionUtil {
    private static readonly ALGORITHM;
    private static readonly IV_LENGTH;
    private static readonly SALT_LENGTH;
    private static readonly TAG_LENGTH;
    private static readonly KEY_LENGTH;
    private static readonly ITERATIONS;
    private static readonly DIGEST;
    static hashPassword(password: string, saltRounds?: number): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    static generateSecureToken(length?: number): string;
    static generateNumericCode(length?: number): string;
    static encrypt(text: string, secretKey: string): string;
    static decrypt(encryptedData: string, secretKey: string): string;
    static createHash(data: string): string;
    static createHmac(data: string, key: string): string;
    static generateUUID(): string;
    static encryptSensitive(data: string, encryptionKey: string): string;
    static decryptSensitive(encryptedData: string, encryptionKey: string): string;
    private static deriveKey;
    static generateKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    static maskData(data: string, visibleChars?: number, maskChar?: string): string;
    static secureCompare(str1: string, str2: string): boolean;
}
