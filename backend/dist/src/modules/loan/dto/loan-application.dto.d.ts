import { LoanType, RepaymentFrequency, LoanStatus } from '../entities/loan.entity';
export declare class UserBasicInfoDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}
export declare class LoanDocumentDto {
    type: string;
    url: string;
    name?: string;
    metadata?: Record<string, any>;
}
export declare class CollateralDto {
    type: string;
    value: number;
    description?: string;
    documents?: LoanDocumentDto[];
}
export declare class GuarantorDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    relationship?: string;
    employmentStatus?: string;
    annualIncome?: number;
    idNumber?: string;
    documents?: LoanDocumentDto[];
}
export declare class CreateLoanApplicationDto {
    type: LoanType;
    amount: number;
    tenureMonths: number;
    interestRate: number;
    repaymentFrequency: RepaymentFrequency;
    purpose?: string;
    description?: string;
    applicationDate?: string;
    requiredByDate?: string;
    documents?: LoanDocumentDto[];
    collateral?: CollateralDto;
    guarantors?: GuarantorDto[];
    hasCollateral?: boolean;
    hasGuarantors?: boolean;
    existingLoanId?: string;
    notes?: string;
    employmentStatus?: string;
    employerName?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    yearsEmployed?: number;
    creditScore?: number;
    source?: string;
    campaign?: string;
    referralCode?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateLoanApplicationDto {
    type?: LoanType;
    amount?: number;
    tenureMonths?: number;
    interestRate?: number;
    repaymentFrequency?: RepaymentFrequency;
    status?: LoanStatus;
    purpose?: string;
    description?: string;
    requiredByDate?: string;
    documents?: LoanDocumentDto[];
    collateral?: CollateralDto;
    guarantors?: GuarantorDto[];
    hasCollateral?: boolean;
    hasGuarantors?: boolean;
    notes?: string;
    employmentStatus?: string;
    employerName?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    yearsEmployed?: number;
    creditScore?: number;
    metadata?: Record<string, any>;
    reviewerNotes?: string;
    rejectionReason?: string;
}
export declare class LoanApplicationFilterDto {
    status?: LoanStatus;
    type?: LoanType;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class LoanApplicationResponseDto {
    id: string;
    applicationNumber: string;
    type: LoanType;
    amount: number;
    tenureMonths: number;
    interestRate: number;
    repaymentFrequency: RepaymentFrequency;
    status: LoanStatus;
    purpose?: string;
    description?: string;
    applicationDate: Date;
    requiredByDate?: Date;
    borrowerId: string;
    borrower: UserBasicInfoDto;
    documents?: LoanDocumentDto[];
    collateral?: CollateralDto;
    guarantors?: GuarantorDto[];
    hasCollateral?: boolean;
    hasGuarantors?: boolean;
    existingLoanId?: string;
    notes?: string;
    employmentStatus?: string;
    employerName?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    yearsEmployed?: number;
    creditScore?: number;
    source?: string;
    campaign?: string;
    referralCode?: string;
    metadata?: Record<string, any>;
    reviewerNotes?: string;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    loanId?: string;
    get isComplete(): boolean;
}
