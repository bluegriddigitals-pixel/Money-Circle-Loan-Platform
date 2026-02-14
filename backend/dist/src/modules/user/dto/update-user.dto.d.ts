import { UserRole, AccountStatus, VerificationStatus } from '../entities/user.entity';
export declare class SecurityQuestionDto {
    question?: string;
    answer?: string;
}
export declare class NotificationPreferencesDto {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
}
export declare class PrivacySettingsDto {
    profileVisibility?: string;
    activityVisibility?: string;
    searchVisibility?: boolean;
}
export declare class SecuritySettingsDto {
    twoFactorEnabled?: boolean;
    biometricEnabled?: boolean;
    sessionTimeout?: number;
    loginAlerts?: boolean;
    unusualActivityAlerts?: boolean;
}
export declare class PreferencesDto {
    notification?: NotificationPreferencesDto;
    privacy?: PrivacySettingsDto;
    security?: SecuritySettingsDto;
}
export declare class UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    role?: UserRole;
    accountStatus?: AccountStatus;
    verificationStatus?: VerificationStatus;
    password?: string;
    currentPassword?: string;
    termsVersion?: string;
    privacyVersion?: string;
    marketingConsent?: boolean;
    dataProcessingConsent?: boolean;
    securityQuestions?: SecurityQuestionDto[];
    employmentStatus?: string;
    employerName?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    yearsEmployed?: number;
    language?: string;
    currency?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    idNumber?: string;
    idType?: string;
    nationality?: string;
    preferences?: PreferencesDto;
    profilePicture?: string;
    bio?: string;
    website?: string;
    socialLinks?: string[];
    isVerified?: boolean;
    updatedBy?: string;
}
