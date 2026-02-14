import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanDocument } from './loan-document.entity';
import { User } from '../../user/entities/user.entity';
export declare enum GuarantorStatus {
    PENDING = "pending",
    INVITED = "invited",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    VERIFIED = "verified",
    ACTIVE = "active",
    RELEASED = "released",
    TERMINATED = "terminated"
}
export declare enum GuarantorType {
    PERSONAL = "personal",
    CORPORATE = "corporate",
    INSTITUTIONAL = "institutional"
}
export declare enum RelationshipType {
    FAMILY_MEMBER = "family_member",
    FRIEND = "friend",
    BUSINESS_PARTNER = "business_partner",
    EMPLOYER = "employer",
    COLLEAGUE = "colleague",
    OTHER = "other"
}
export declare enum GuaranteeType {
    FULL = "full",
    PARTIAL = "partial",
    JOINT = "joint",
    SEVERAL = "several"
}
export declare class LoanGuarantor {
    id: string;
    guarantorNumber: string;
    loanId: string;
    loanApplicationId: string;
    userId: string;
    guarantorType: GuarantorType;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phoneNumber: string;
    alternatePhoneNumber: string;
    dateOfBirth: Date;
    nationalId: string;
    passportNumber: string;
    taxId: string;
    relationship: RelationshipType;
    relationshipDescription: string;
    yearsKnown: number;
    occupation: string;
    employer: string;
    jobTitle: string;
    employmentDurationMonths: number;
    annualIncome: number;
    additionalAnnualIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    monthlyExpenses: number;
    monthlyDebt: number;
    creditScore: number;
    creditReport: Record<string, any>;
    guaranteeType: GuaranteeType;
    guaranteeAmount: number;
    guaranteePercentage: number;
    maxLiability: number;
    providedCollateral: Array<{
        type: string;
        value: number;
        description: string;
    }>;
    status: GuarantorStatus;
    invitedAt: Date;
    invitationToken: string;
    invitationExpiry: Date;
    acceptedAt: Date;
    declinedAt: Date;
    declineReason: string;
    verifiedAt: Date;
    verificationMethod: string;
    verificationNotes: string;
    activatedAt: Date;
    releasedAt: Date;
    releaseReason: string;
    terminatedAt: Date;
    terminationReason: string;
    agreementSignedAt: Date;
    agreementDocumentPath: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
    bankAccount: {
        bankName: string;
        accountNumber: string;
        routingNumber?: string;
        iban?: string;
        swiftCode?: string;
        accountType: string;
    };
    riskScore: number;
    riskFactors: string[];
    notes: string;
    internalNotes: string;
    tags: string[];
    communicationPreferences: Record<string, boolean>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    version: number;
    loan: Loan;
    loanApplication: LoanApplication;
    user: User;
    documents: LoanDocument[];
    get fullName(): string;
    get age(): number | null;
    get totalAnnualIncome(): number;
    get debtToIncomeRatio(): number | null;
    get isActive(): boolean;
    get isInvitationExpired(): boolean;
    get canBeInvited(): boolean;
    get hasAccepted(): boolean;
    generateGuarantorNumber(): void;
    updateCalculatedFields(): void;
    invite(invitationToken: string, expiryHours?: number): void;
    accept(): void;
    decline(reason: string): void;
    verify(method: string, notes?: string): void;
    activate(): void;
    release(reason: string): void;
    terminate(reason: string): void;
    signAgreement(documentPath: string): void;
    get isValid(): boolean;
    get isEligible(): boolean;
    get riskLevel(): 'low' | 'medium' | 'high';
    static createPersonalGuarantor(data: Partial<LoanGuarantor>): LoanGuarantor;
    static createCorporateGuarantor(data: Partial<LoanGuarantor>): LoanGuarantor;
    updateFinancialInfo(financialData: {
        annualIncome?: number;
        additionalAnnualIncome?: number;
        totalAssets?: number;
        totalLiabilities?: number;
        monthlyExpenses?: number;
        monthlyDebt?: number;
        creditScore?: number;
    }): void;
    addCollateral(collateral: {
        type: string;
        value: number;
        description: string;
    }): void;
    removeCollateral(index: number): void;
    addRiskFactor(factor: string): void;
    removeRiskFactor(factor: string): void;
    addTag(tag: string): void;
    removeTag(tag: string): void;
    toJSON(): any;
}
