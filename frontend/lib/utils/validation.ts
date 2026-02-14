import { z } from 'zod';

// ==================== SOUTH AFRICAN ID VALIDATION ====================

/**
 * Validate South African ID number
 * Format: YYMMDD SSSS C A
 * - YYMMDD: Date of birth
 * - SSSS: Gender (0-4 female, 5-9 male)
 * - C: Citizenship (0 SA, 1 other)
 * - A: Checksum digit
 */
export const validateSouthAfricanId = (idNumber: string): boolean => {
  // Remove any non-digit characters
  const cleaned = idNumber.replace(/\D/g, '');
  
  // Check length
  if (cleaned.length !== 13) return false;
  
  // Check if all characters are digits
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Extract components
  const year = parseInt(cleaned.substring(0, 2));
  const month = parseInt(cleaned.substring(2, 4));
  const day = parseInt(cleaned.substring(4, 6));
  
  // Validate date
  const currentYear = new Date().getFullYear() % 100;
  const century = year <= currentYear ? 2000 : 1900;
  const birthDate = new Date(century + year, month - 1, day);
  
  if (
    birthDate.getFullYear() !== century + year ||
    birthDate.getMonth() + 1 !== month ||
    birthDate.getDate() !== day
  ) {
    return false;
  }
  
  // Validate checksum using Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(cleaned[12]);
};

export const extractIdInfo = (idNumber: string): {
  dateOfBirth: string;
  gender: 'male' | 'female';
  citizenship: 'SA' | 'other';
} | null => {
  if (!validateSouthAfricanId(idNumber)) return null;
  
  // Format: YYMMDD SSSS C A
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));
  const genderDigit = parseInt(idNumber.substring(6, 7));
  const citizenshipDigit = parseInt(idNumber.substring(10, 11));
  
  // Determine century
  const currentYear = new Date().getFullYear() % 100;
  const century = year <= currentYear ? 2000 : 1900;
  
  return {
    dateOfBirth: `${century + year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    gender: genderDigit >= 5 ? 'male' : 'female',
    citizenship: citizenshipDigit === 0 ? 'SA' : 'other',
  };
};

// ==================== EMAIL VALIDATION ====================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validateEmailDomain = (email: string, allowedDomains?: string[]): boolean => {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

// ==================== PHONE VALIDATION ====================

export const validateSouthAfricanPhone = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for valid SA phone numbers:
  // - 10 digits starting with 0 (e.g., 0712345678)
  // - 11 digits starting with 27 (e.g., 27712345678)
  // - 12 digits starting with +27 (e.g., +27712345678)
  const saPhoneRegex = /^(?:(?:\+27|27)|0)[1-9][0-9]{8}$/;
  return saPhoneRegex.test(cleaned);
};

export const formatPhoneForDb = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to international format (+27...)
  if (cleaned.startsWith('0')) {
    return '+27' + cleaned.slice(1);
  } else if (cleaned.startsWith('27')) {
    return '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
};

// ==================== PASSWORD VALIDATION ====================

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 25;
  } else {
    score += 15;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    errors.push('Password must contain at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20;
  } else {
    errors.push('Password must contain at least one special character');
  }

  // Common patterns check
  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123',
    'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Password contains common patterns that are easy to guess');
  } else {
    score += 10;
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains repeated characters');
  } else {
    score += 10;
  }

  // Sequential characters check
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  const lowerPassword = password.toLowerCase();
  
  if (sequences.some(seq => {
    for (let i = 0; i < seq.length - 3; i++) {
      if (lowerPassword.includes(seq.substring(i, i + 3))) return true;
    }
    return false;
  })) {
    errors.push('Password contains sequential characters');
  } else {
    score += 10;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 80) {
    strength = 'very-strong';
  } else if (score >= 60) {
    strength = 'strong';
  } else if (score >= 40) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

// ==================== AMOUNT VALIDATION ====================

export const validateAmount = (amount: number, min?: number, max?: number): boolean => {
  if (isNaN(amount) || amount <= 0) return false;
  if (min && amount < min) return false;
  if (max && amount > max) return false;
  return true;
};

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['ZAR', 'USD', 'EUR', 'GBP'];
  return validCurrencies.includes(currency);
};

// ==================== DATE VALIDATION ====================

export const validateDate = (date: string | Date): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const validateFutureDate = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  return validateDate(date) && d > now;
};

export const validatePastDate = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  return validateDate(date) && d < now;
};

export const validateAge = (dateOfBirth: string | Date, minAge: number = 18): boolean => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age >= minAge;
};

// ==================== LOAN VALIDATION ====================

export interface LoanValidationParams {
  amount: number;
  tenureMonths: number;
  interestRate: number;
  monthlyIncome?: number;
  creditScore?: number;
}

export const validateLoanAmount = (
  amount: number,
  minAmount: number,
  maxAmount: number
): boolean => {
  return amount >= minAmount && amount <= maxAmount;
};

export const validateLoanTenure = (
  tenureMonths: number,
  minTenure: number,
  maxTenure: number
): boolean => {
  return tenureMonths >= minTenure && tenureMonths <= maxTenure;
};

export const validateAffordability = (
  monthlyPayment: number,
  monthlyIncome: number,
  maxDebtToIncomeRatio: number = 0.4
): boolean => {
  if (!monthlyIncome || monthlyIncome <= 0) return false;
  const debtToIncomeRatio = monthlyPayment / monthlyIncome;
  return debtToIncomeRatio <= maxDebtToIncomeRatio;
};

export const validateCreditScore = (
  creditScore: number,
  minCreditScore: number = 300
): boolean => {
  return creditScore >= minCreditScore;
};

// ==================== BANKING VALIDATION ====================

export const validateBankAccountNumber = (accountNumber: string): boolean => {
  // Basic validation - at least 6 digits, max 12 digits
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length >= 6 && cleaned.length <= 12;
};

export const validateBranchCode = (branchCode: string): boolean => {
  // SA branch codes are 6 digits
  const cleaned = branchCode.replace(/\D/g, '');
  return cleaned.length === 6;
};

export const validateSwiftCode = (swiftCode: string): boolean => {
  // SWIFT codes are 8 or 11 characters
  const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return swiftRegex.test(swiftCode.toUpperCase());
};

export const validateBankName = (bankName: string): boolean => {
  const validBanks = [
    'ABSA', 'FNB', 'Standard Bank', 'Nedbank', 'Capitec',
    'Investec', 'African Bank', 'Bidvest Bank', 'Discovery Bank',
    'TymeBank', 'Bank Zero', 'Grindrod Bank', 'Sasfin Bank'
  ];
  
  return validBanks.includes(bankName);
};

// ==================== KYC DOCUMENT VALIDATION ====================

export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    fileSize?: number;
    fileType?: string;
    pages?: number;
  };
}

export const validateDocumentFile = (
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png']
): DocumentValidationResult => {
  const errors: string[] = [];
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    metadata: {
      fileSize: file.size,
      fileType: file.type,
    },
  };
};

export const validateDocumentExpiry = (expiryDate?: string): boolean => {
  if (!expiryDate) return true; // No expiry date means it doesn't expire
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  return expiry > today;
};

// ==================== BUSINESS VALIDATION ====================

export const validateRegistrationNumber = (regNumber: string): boolean => {
  // SA company registration number format: YYYY/123456/07 or 2023/123456/07
  const regRegex = /^(19|20)\d{2}\/\d{6}\/\d{2}$/;
  return regRegex.test(regNumber);
};

export const validateTaxNumber = (taxNumber: string): boolean => {
  // SA tax number format: 1234567890 (10 digits)
  const cleaned = taxNumber.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateVatNumber = (vatNumber: string): boolean => {
  // SA VAT number format: 1234567890 (10 digits)
  const cleaned = vatNumber.replace(/\D/g, '');
  return cleaned.length === 10;
};

// ==================== GENERAL VALIDATION ====================

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

export const validateRange = (
  value: number,
  min: number,
  max: number,
  inclusive: boolean = true
): boolean => {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
};

export const validateLength = (
  value: string,
  min: number,
  max: number
): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

// ==================== URL VALIDATION ====================

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateSecureUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// ==================== PERMISSION VALIDATION ====================

export const validateRoleAccess = (
  userRole: string,
  requiredRoles: string | string[]
): boolean => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
};

export const validatePermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return userPermissions.includes(requiredPermission);
};

// ==================== ZOD SCHEMAS ====================

// Reusable Zod schemas for form validation
export const zodSchemas = {
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim()),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .refine(
      (pwd) => /[A-Z]/.test(pwd),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (pwd) => /[a-z]/.test(pwd),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (pwd) => /[0-9]/.test(pwd),
      'Password must contain at least one number'
    )
    .refine(
      (pwd) => /[!@#$%^&*]/.test(pwd),
      'Password must contain at least one special character'
    ),

  phoneNumber: z.string()
    .refine(validateSouthAfricanPhone, 'Invalid South African phone number')
    .transform(formatPhoneForDb),

  idNumber: z.string()
    .refine(validateSouthAfricanId, 'Invalid South African ID number'),

  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount must be less than 1,000,000'),

  dateOfBirth: z.string()
    .refine(validateDate, 'Invalid date')
    .refine((dob) => validateAge(dob, 18), 'You must be at least 18 years old'),

  bankAccountNumber: z.string()
    .refine(validateBankAccountNumber, 'Invalid bank account number'),

  branchCode: z.string()
    .refine(validateBranchCode, 'Branch code must be 6 digits'),

  registrationNumber: z.string()
    .refine(validateRegistrationNumber, 'Invalid company registration number'),

  taxNumber: z.string()
    .refine(validateTaxNumber, 'Invalid tax number'),

  url: z.string()
    .refine(validateUrl, 'Invalid URL')
    .refine(validateSecureUrl, 'URL must use HTTPS'),

  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
};