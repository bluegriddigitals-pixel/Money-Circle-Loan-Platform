import { UserRole } from '../../user/entities/user.entity';
export declare class SecurityQuestionDto {
    question: string;
    answer: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    role?: UserRole;
    termsVersion?: string;
    privacyVersion?: string;
    marketingConsent?: boolean;
    dataProcessingConsent?: boolean;
    securityQuestions?: SecurityQuestionDto[];
    source?: string;
    campaign?: string;
    medium?: string;
    referralCode?: string;
}
