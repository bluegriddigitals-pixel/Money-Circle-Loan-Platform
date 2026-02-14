export declare class ValidationUtil {
    static isValidEmail(email: string): boolean;
    static isValidPhoneNumber(phoneNumber: string): boolean;
    static isStrongPassword(password: string, options?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
    }): boolean;
    static isValidUrl(url: string): boolean;
    static isValidDate(date: string, format?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'): boolean;
    static isValidAge(dateOfBirth: Date, minAge?: number): boolean;
    static isValidNigerianNIN(nin: string): boolean;
    static isValidNigerianBVN(bvn: string): boolean;
    static isValidPassportNumber(passportNumber: string): boolean;
    static isValidCreditCard(cardNumber: string): boolean;
    static isInRange(value: number, min: number, max: number): boolean;
    static isValidJSON(str: string): boolean;
    static isValidAmount(amount: number): boolean;
    static isAlphanumeric(str: string): boolean;
    static isAlpha(str: string): boolean;
    static isUUID(str: string, version?: 4 | 5): boolean;
    static isValidHexColor(color: string): boolean;
    static isValidIP(ip: string): boolean;
}
