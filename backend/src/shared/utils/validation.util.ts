import * as validator from 'class-validator';

export class ValidationUtil {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (E.164 format)
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string, options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }): boolean {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
    } = options || {};

    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/\d/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate date format
   */
  static isValidDate(date: string, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'): boolean {
    const patterns = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
    };

    if (!patterns[format].test(date)) return false;

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

  /**
   * Validate age (must be at least 18)
   */
  static isValidAge(dateOfBirth: Date, minAge: number = 18): boolean {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age >= minAge;
  }

  /**
   * Validate Nigerian NIN (National Identification Number)
   */
  static isValidNigerianNIN(nin: string): boolean {
    return /^\d{11}$/.test(nin);
  }

  /**
   * Validate Nigerian BVN (Bank Verification Number)
   */
  static isValidNigerianBVN(bvn: string): boolean {
    return /^\d{11}$/.test(bvn);
  }

  /**
   * Validate international passport number
   */
  static isValidPassportNumber(passportNumber: string): boolean {
    // Generic validation - can be customized per country
    return /^[A-Z0-9]{6,9}$/.test(passportNumber);
  }

  /**
   * Validate credit card number using Luhn algorithm
   */
  static isValidCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;

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

  /**
   * Validate if value is within range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate if string is a valid JSON
   */
  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate if value is a valid amount (positive number with up to 2 decimal places)
   */
  static isValidAmount(amount: number): boolean {
    return amount > 0 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
  }

  /**
   * Validate if string contains only alphanumeric characters
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Validate if string contains only letters
   */
  static isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str);
  }

  /**
   * Validate if string is a valid UUID
   */
  static isUUID(str: string, version: 4 | 5 = 4): boolean {
    const uuidPattern = {
      4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    };
    return uuidPattern[version].test(str);
  }

  /**
   * Validate if string is a valid hex color
   */
  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Validate if string is a valid IP address (IPv4 or IPv6)
   */
  static isValidIP(ip: string): boolean {
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }
}