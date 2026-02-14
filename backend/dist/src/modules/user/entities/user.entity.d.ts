import { UserProfile } from './user-profile.entity';
import { LoanApplication } from '../../loan/entities/loan-application.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { LoanGuarantor } from '../../loan/entities/loan-guarantor.entity';
import { PaymentMethod } from '../../payment/entities/payment-method.entity';
import { PayoutRequest } from '../../payment/entities/payout-request.entity';
import { Investment } from '../../marketplace/entities/investment.entity';
import { AmlAlert } from '../../compliance/entities/aml-alert.entity';
import { SanctionScreening } from '../../compliance/entities/sanction-screening.entity';
import { ComplianceCheck } from '../../compliance/entities/compliance-check.entity';
import { Kyc } from '../../compliance/entities/kyc.entity';
import { KycStatus } from '../../compliance/entities/kyc.entity';
export { KycStatus } from '../../compliance/entities/kyc.entity';
export declare enum UserRole {
    BORROWER = "borrower",
    LENDER = "lender",
    ADMIN = "admin",
    AUDITOR = "auditor",
    TRANSACTION_ADMIN = "transaction_admin",
    SYSTEM_ADMIN = "system_admin",
    COMPLIANCE_OFFICER = "compliance_officer",
    RISK_ANALYST = "risk_analyst",
    CUSTOMER_SUPPORT = "customer_support",
    FINANCIAL_ADVISOR = "financial_advisor",
    LEGAL_ADVISOR = "legal_advisor",
    PARTNER = "partner",
    AFFILIATE = "affiliate"
}
export declare enum AccountStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    DEACTIVATED = "DEACTIVATED",
    UNDER_REVIEW = "UNDER_REVIEW",
    REJECTED = "REJECTED",
    FROZEN = "FROZEN",
    RESTRICTED = "RESTRICTED"
}
export declare enum VerificationStatus {
    UNVERIFIED = "UNVERIFIED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
    PHONE_VERIFIED = "PHONE_VERIFIED",
    FULLY_VERIFIED = "FULLY_VERIFIED"
}
export declare enum LoginMethod {
    EMAIL_PASSWORD = "email_password",
    GOOGLE = "google",
    FACEBOOK = "facebook",
    APPLE = "apple",
    PHONE_OTP = "phone_otp",
    BIOMETRIC = "biometric"
}
export declare enum SubscriptionTier {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    ENTERPRISE = "enterprise"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    refreshTokenHash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    role: UserRole;
    accountStatus: AccountStatus;
    kycStatus: KycStatus;
    verificationStatus: VerificationStatus;
    emailVerificationToken: string;
    emailVerificationTokenExpiry: Date;
    phoneVerificationCode: string;
    phoneVerificationCodeExpiry: Date;
    twoFactorSecret: string;
    isTwoFactorEnabled: boolean;
    backupCodes: string;
    lastLoginAt: Date;
    lastActivityAt: Date;
    lastPasswordChangeAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    deactivatedAt: Date;
    deactivationReason: string;
    registrationIp: string;
    registrationUserAgent: string;
    registrationDeviceFingerprint: string;
    acceptedTermsVersion: string;
    acceptedPrivacyVersion: string;
    marketingConsent: boolean;
    dataProcessingConsent: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
    timezone: string;
    profileImage: string;
    bio: string;
    occupation: string;
    company: string;
    website: string;
    socialMedia: Record<string, string>;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    passwordResetToken: string;
    passwordResetTokenExpiry: Date;
    failedLoginAttempts: number;
    accountLockedUntil: Date;
    passwordHistory: string[];
    securityQuestions: Array<{
        question: string;
        answer: string;
        createdAt: Date;
    }>;
    lastLoginIp: string;
    lastLoginDevice: string;
    lastLoginMethod: LoginMethod;
    subscriptionTier: SubscriptionTier;
    subscriptionExpiry: Date;
    referralCode: string;
    referredBy: string;
    referralCount: number;
    referralEarnings: number;
    externalId: string;
    externalProvider: string;
    metadata: Record<string, any>;
    tags: string[];
    preferences: Record<string, any>;
    profile: UserProfile;
    loanApplications: LoanApplication[];
    loans: Loan[];
    guarantors: LoanGuarantor[];
    paymentMethods: PaymentMethod[];
    payoutRequests: PayoutRequest[];
    investments: Investment[];
    kyc: Kyc[];
    complianceChecks: ComplianceCheck[];
    sanctionScreenings: SanctionScreening[];
    amlAlerts: AmlAlert[];
    get fullName(): string;
    get initials(): string;
    get isActive(): boolean;
    get isKycVerified(): boolean;
    get isEmailVerified(): boolean;
    get isPhoneVerified(): boolean;
    get isFullyVerified(): boolean;
    get age(): number | null;
    get isOfLegalAge(): boolean;
    get accountAgeInDays(): number;
    get isNewAccount(): boolean;
    get canApplyForLoan(): boolean;
    get canInvest(): boolean;
    get isAdmin(): boolean;
    get isStaff(): boolean;
    get hasPremiumSubscription(): boolean;
    get isSubscriptionActive(): boolean;
    beforeInsert(): Promise<void>;
    beforeUpdate(): Promise<void>;
    afterInsert(): Promise<void>;
    afterUpdate(): Promise<void>;
    afterRemove(): Promise<void>;
    validateAge(): void;
    updateActivity(): void;
    verifyEmail(): void;
    verifyPhone(): void;
    suspend(reason: string): void;
    activate(): void;
    deactivate(reason: string): void;
    freeze(reason: string): void;
    restrict(reason: string): void;
    completeKyc(): void;
    rejectKyc(reason: string): void;
    setKycInProgress(): void;
    private generateReferralCode;
    toJSON(): any;
    toString(): string;
}
