import { UserProfile } from "./user-profile.entity";
export declare enum UserRole {
    BORROWER = "borrower",
    LENDER = "lender",
    AUDITOR = "auditor",
    TRANSACTION_ADMIN = "transaction_admin",
    SYSTEM_ADMIN = "system_admin"
}
export declare enum AccountStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DEACTIVATED = "deactivated"
}
export declare enum KycStatus {
    NOT_STARTED = "not_started",
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class User {
    id: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationalId: string;
    taxNumber: string;
    role: UserRole;
    status: AccountStatus;
    kycStatus: KycStatus;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountType: string;
    branchCode: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    is2faEnabled: boolean;
    lastLogin: Date;
    failedLoginAttempts: number;
    lockedUntil: Date;
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
    deactivatedAt: Date;
    get fullName(): string;
    isActive(): boolean;
    isKycVerified(): boolean;
}
