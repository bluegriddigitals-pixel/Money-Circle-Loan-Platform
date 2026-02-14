import { UserRole } from '../entities/user.entity';
export declare class SecurityQuestionDto {
    question: string;
    answer: string;
}
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    role: UserRole;
    password: string;
    termsVersion?: string;
    privacyVersion?: string;
    marketingConsent?: boolean;
    dataProcessingConsent?: boolean;
    source?: string;
    campaign?: string;
    medium?: string;
    referralCode?: string;
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
    deviceFingerprint?: string;
}
