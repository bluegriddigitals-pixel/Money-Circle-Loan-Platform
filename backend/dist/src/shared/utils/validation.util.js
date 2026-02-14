"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = void 0;
class ValidationUtil {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
    }
    static isStrongPassword(password, options) {
        const { minLength = 8, requireUppercase = true, requireLowercase = true, requireNumbers = true, requireSpecialChars = true, } = options || {};
        if (password.length < minLength)
            return false;
        if (requireUppercase && !/[A-Z]/.test(password))
            return false;
        if (requireLowercase && !/[a-z]/.test(password))
            return false;
        if (requireNumbers && !/\d/.test(password))
            return false;
        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
            return false;
        return true;
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static isValidDate(date, format = 'YYYY-MM-DD') {
        const patterns = {
            'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
            'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
            'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
        };
        if (!patterns[format].test(date))
            return false;
        const [year, month, day] = format === 'YYYY-MM-DD'
            ? date.split('-').map(Number)
            : format === 'DD/MM/YYYY'
                ? date.split('/').reverse().map(Number)
                : date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.getFullYear() === year &&
            dateObj.getMonth() === month - 1 &&
            dateObj.getDate() === day;
    }
    static isValidAge(dateOfBirth, minAge = 18) {
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDiff = today.getMonth() - dateOfBirth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age >= minAge;
    }
    static isValidNigerianNIN(nin) {
        return /^\d{11}$/.test(nin);
    }
    static isValidNigerianBVN(bvn) {
        return /^\d{11}$/.test(bvn);
    }
    static isValidPassportNumber(passportNumber) {
        return /^[A-Z0-9]{6,9}$/.test(passportNumber);
    }
    static isValidCreditCard(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(cleaned))
            return false;
        let sum = 0;
        let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    static isInRange(value, min, max) {
        return value >= min && value <= max;
    }
    static isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
    static isValidAmount(amount) {
        return amount > 0 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
    }
    static isAlphanumeric(str) {
        return /^[a-zA-Z0-9]+$/.test(str);
    }
    static isAlpha(str) {
        return /^[a-zA-Z]+$/.test(str);
    }
    static isUUID(str, version = 4) {
        const uuidPattern = {
            4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        };
        return uuidPattern[version].test(str);
    }
    static isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }
    static isValidIP(ip) {
        const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    }
}
exports.ValidationUtil = ValidationUtil;
//# sourceMappingURL=validation.util.js.map