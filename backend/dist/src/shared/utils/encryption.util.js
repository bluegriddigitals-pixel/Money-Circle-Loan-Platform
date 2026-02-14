"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionUtil = void 0;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
class EncryptionUtil {
    static async hashPassword(password, saltRounds = 12) {
        return bcrypt.hash(password, saltRounds);
    }
    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    static generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    static generateNumericCode(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
    static encrypt(text, secretKey) {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const key = this.deriveKey(secretKey, salt);
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        const result = Buffer.concat([salt, iv, tag, encrypted]);
        return result.toString('base64');
    }
    static decrypt(encryptedData, secretKey) {
        const data = Buffer.from(encryptedData, 'base64');
        const salt = data.subarray(0, this.SALT_LENGTH);
        const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
        const tag = data.subarray(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
        const key = this.deriveKey(secretKey, salt);
        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
    static createHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    static createHmac(data, key) {
        return crypto.createHmac('sha256', key).update(data).digest('hex');
    }
    static generateUUID() {
        return crypto.randomUUID();
    }
    static encryptSensitive(data, encryptionKey) {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    static decryptSensitive(encryptedData, encryptionKey) {
        const [ivHex, encrypted] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST);
    }
    static generateKeyPair() {
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
    static maskData(data, visibleChars = 4, maskChar = '*') {
        if (data.length <= visibleChars) {
            return maskChar.repeat(data.length);
        }
        const visiblePart = data.slice(-visibleChars);
        const maskedPart = maskChar.repeat(data.length - visibleChars);
        return maskedPart + visiblePart;
    }
    static secureCompare(str1, str2) {
        try {
            return crypto.timingSafeEqual(Buffer.from(str1), Buffer.from(str2));
        }
        catch {
            return false;
        }
    }
}
exports.EncryptionUtil = EncryptionUtil;
EncryptionUtil.ALGORITHM = 'aes-256-gcm';
EncryptionUtil.IV_LENGTH = 16;
EncryptionUtil.SALT_LENGTH = 64;
EncryptionUtil.TAG_LENGTH = 16;
EncryptionUtil.KEY_LENGTH = 32;
EncryptionUtil.ITERATIONS = 100000;
EncryptionUtil.DIGEST = 'sha256';
//# sourceMappingURL=encryption.util.js.map