import { UserRole, AccountStatus, VerificationStatus } from '../entities/user.entity';
export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    role: UserRole;
    accountStatus: AccountStatus;
    kycStatus: string;
    verificationStatus: VerificationStatus;
    profilePicture?: string;
    bio?: string;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    backupCodes?: string[];
    lastLoginAt?: Date;
    lastLoginIp?: string;
    lastLoginDevice?: string;
    lastActivityAt?: Date;
    failedLoginAttempts: number;
    accountLockedUntil?: Date;
    passwordChangedAt?: Date;
    passwordHistory?: string[];
    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    phoneVerificationCode?: string;
    phoneVerificationCodeExpiry?: Date;
    passwordResetToken?: string;
    passwordResetTokenExpiry?: Date;
    registrationIp?: string;
    registrationUserAgent?: string;
    registrationDeviceFingerprint?: string;
    referralCode?: string;
    referredBy?: string;
    acceptedTermsVersion: string;
    acceptedPrivacyVersion: string;
    marketingConsent: boolean;
    dataProcessingConsent: boolean;
    consentTimestamps?: Record<string, Date>;
    metadata?: Record<string, any>;
    tags?: string[];
    notes?: string;
    securityQuestions?: Array<{
        question: string;
        answer: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    fullName?: string;
    initials?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isKycVerified?: boolean;
    isAccountLocked?: boolean;
    accountAge?: number;
}
export interface IUserProfile {
    id: string;
    userId: string;
    employmentStatus?: string;
    employerName?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    yearsEmployed?: number;
    creditScore?: number;
    riskLevel?: string;
    riskScore?: number;
    totalBorrowed?: number;
    totalRepaid?: number;
    outstandingBalance?: number;
    totalInvested?: number;
    totalEarned?: number;
    averageReturn?: number;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    idNumber?: string;
    idType?: string;
    nationality?: string;
    language: string;
    currency: string;
    timezone?: string;
    dateFormat?: string;
    notificationPreferences: Record<string, boolean>;
    privacySettings: {
        profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
        activityVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
        searchVisibility: boolean;
        [key: string]: any;
    };
    securitySettings: {
        twoFactorEnabled: boolean;
        biometricEnabled: boolean;
        sessionTimeout: number;
        loginAlerts: boolean;
        unusualActivityAlerts: boolean;
        [key: string]: any;
    };
    socialLinks?: Record<string, string>;
    website?: string;
    businessName?: string;
    businessRegistration?: string;
    taxId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserSession {
    id: string;
    userId: string;
    token: string;
    refreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    deviceInfo?: {
        platform?: string;
        browser?: string;
        version?: string;
        isMobile?: boolean;
        isTablet?: boolean;
        isDesktop?: boolean;
    };
    location?: {
        country?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        timezone?: string;
    };
    isValid: boolean;
    lastActivityAt: Date;
    expiresAt: Date;
    createdAt: Date;
}
export interface ILoginAttempt {
    id: string;
    userId?: string;
    email?: string;
    ipAddress: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
    attemptedAt: Date;
}
export interface ITokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    kycStatus: string;
    verificationStatus: VerificationStatus;
    twoFactorEnabled: boolean;
    sessionId: string;
    iat?: number;
    exp?: number;
    jti?: string;
    iss?: string;
    aud?: string;
}
export interface IRefreshTokenPayload {
    sub: string;
    type: 'refresh';
    sessionId: string;
    jti: string;
    iat: number;
    exp: number;
}
export interface IAccessTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    permissions?: string[];
    sessionId: string;
    jti: string;
    iat: number;
    exp: number;
}
export interface IUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
    accountStatus: AccountStatus;
    kycStatus: string;
    verificationStatus: VerificationStatus;
    profilePicture?: string;
    isTwoFactorEnabled: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isKycVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile?: Partial<IUserProfile>;
}
export interface IUserFilters {
    role?: UserRole;
    accountStatus?: AccountStatus;
    verificationStatus?: VerificationStatus;
    kycStatus?: string;
    isActive?: boolean;
    search?: string;
    createdFrom?: Date;
    createdTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface IUserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByRole: Record<UserRole, number>;
    usersByStatus: Record<AccountStatus, number>;
    usersByKycStatus: Record<string, number>;
    topReferrers?: Array<{
        userId: string;
        name: string;
        referralCount: number;
    }>;
}
export interface IDeviceInfo {
    fingerprint: string;
    platform?: string;
    browser?: string;
    version?: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    language?: string;
    screenResolution?: string;
    timezone?: string;
    userAgent: string;
}
export interface ILocationInfo {
    ip: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
    proxy?: boolean;
    hosting?: boolean;
}
export interface IAuditInfo {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    location?: ILocationInfo;
    device?: IDeviceInfo;
    timestamp: Date;
}
