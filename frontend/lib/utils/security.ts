import CryptoJS from 'crypto-js';

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

// ==================== ENCRYPTION UTILITIES ====================

/**
 * Encrypt sensitive data
 */
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt encrypted data
 */
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Hash data using SHA-256
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Generate random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
};

// ==================== PASSWORD UTILITIES ====================

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): {
  score: number; // 0-100
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters');
  } else if (password.length >= 12) {
    score += 25;
  } else {
    score += 15;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters');
  }

  // Uniqueness/pattern check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeated characters');
  } else {
    score += 10;
  }

  // Determine strength label
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 80) {
    strength = 'very-strong';
  } else if (score >= 60) {
    strength = 'strong';
  } else if (score >= 40) {
    strength = 'medium';
  }

  return { score, strength, feedback };
};

/**
 * Generate random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitize input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* attributes
  html = html.replace(/\s+on\w+="[^"]*"/gi, '');
  html = html.replace(/\s+on\w+='[^']*'/gi, '');
  html = html.replace(/\s+on\w+=\w+/gi, '');
  
  // Remove javascript: links
  html = html.replace(/javascript:/gi, '');
  
  return html;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase().replace(/[<>()\[\]\\,;:%]/g, '');
};

/**
 * Validate and sanitize phone number
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

// ==================== TOKEN UTILITIES ====================

/**
 * Parse JWT token
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// ==================== CSRF PROTECTION ====================

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return generateSecureToken(32);
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// ==================== RATE LIMITING HELPERS ====================

/**
 * Create a simple in-memory rate limiter
 */
export class RateLimiter {
  private attempts: Map<string, number[]>;
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];
    
    // Remove old attempts
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.maxAttempts) {
      return false;
    }
    
    validTimestamps.push(now);
    this.attempts.set(key, validTimestamps);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const timestamps = this.attempts.get(key) || [];
    const validTimestamps = timestamps.filter(t => Date.now() - t < this.windowMs);
    return Math.max(0, this.maxAttempts - validTimestamps.length);
  }
}

// ==================== CONTENT SECURITY ====================

/**
 * Generate Content Security Policy header
 */
export const generateCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ].join('; ');
};

// ==================== SESSION MANAGEMENT ====================

/**
 * Get session timeout in milliseconds
 */
export const getSessionTimeout = (role?: string): number => {
  // Different timeouts based on role
  const timeouts: Record<string, number> = {
    borrower: 30 * 60 * 1000, // 30 minutes
    lender: 30 * 60 * 1000, // 30 minutes
    auditor: 60 * 60 * 1000, // 1 hour
    transaction_admin: 60 * 60 * 1000, // 1 hour
    system_admin: 120 * 60 * 1000, // 2 hours
  };
  
  return role && timeouts[role] ? timeouts[role] : 30 * 60 * 1000;
};

/**
 * Check if session is about to expire
 */
export const isSessionExpiring = (lastActivity: number, role?: string): boolean => {
  const timeout = getSessionTimeout(role);
  const warningTime = 5 * 60 * 1000; // 5 minutes warning
  const timeElapsed = Date.now() - lastActivity;
  
  return timeElapsed > (timeout - warningTime);
};

// ==================== AUDIT LOGGING ====================

/**
 * Create audit log entry
 */
export const createAuditLog = (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  changes?: any
): any => {
  return {
    userId,
    action,
    entityType,
    entityId,
    changes,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    ip: '0.0.0.0', // Should be set by server
    sessionId: sessionStorage.getItem('sessionId'),
  };
};

// ==================== DATA MASKING ====================

/**
 * Mask sensitive data for display
 */
export const maskData = {
  email: (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedLocal = localPart.charAt(0) + '***' + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    
    const last4 = cleaned.slice(-4);
    return '***' + last4;
  },

  id: (id: string): string => {
    if (id.length < 6) return id;
    const last4 = id.slice(-4);
    return '********' + last4;
  },

  accountNumber: (accountNumber: string): string => {
    if (accountNumber.length < 4) return accountNumber;
    const last4 = accountNumber.slice(-4);
    return '••••' + last4;
  },

  name: (name: string): string => {
    if (name.length < 2) return name;
    return name.charAt(0) + '***' + name.charAt(name.length - 1);
  },
};

// ==================== DEVICE FINGERPRINTING ====================

/**
 * Generate device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    // Remove navigator.deviceMemory as it's not universally supported
    // Or use it with optional chaining:
    (navigator as any).deviceMemory || 'unknown',
  ];
  
  return hashData(components.join('||'));
};

// ==================== SECURITY HEADERS ====================

/**
 * Get security headers for API responses
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
};