import { LoanType, RepaymentFrequency, LoanStatus } from '../entities/loan.entity';
export declare class UserBasicInfoDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}
export declare class LoanDocumentResponseDto {
    id: string;
    type: string;
    url: string;
    name?: string;
    uploadedAt: Date;
}
export declare class CollateralResponseDto {
    id: string;
    type: string;
    value: number;
    description?: string;
    documents: LoanDocumentResponseDto[];
}
export declare class RepaymentScheduleItemDto {
    period: number;
    dueDate: Date;
    principal: number;
    interest: number;
    total: number;
    remainingBalance: number;
    status: string;
}
export declare class LoanResponseDto {
    id: string;
    loanNumber: string;
    type: LoanType;
    amount: number;
    interestRate: number;
    tenureMonths: number;
    repaymentFrequency: RepaymentFrequency;
    purpose?: string;
    status: LoanStatus;
    amountPaid: number;
    outstandingBalance: number;
    totalInterest?: number;
    totalFees?: number;
    monthlyInstallment?: number;
    disbursementDate?: Date;
    firstRepaymentDate?: Date;
    lastRepaymentDate?: Date;
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
    defaultedAt?: Date;
    defaultReason?: string;
    completedAt?: Date;
    currency?: string;
    gracePeriodDays?: number;
    latePenaltyRate?: number;
    latePenaltyAmount?: number;
    latePaymentCount?: number;
    missedPaymentCount?: number;
    riskRating?: string;
    creditScoreAtDisbursement?: number;
    debtToIncomeRatio?: number;
    collateralCoverageRatio?: number;
    totalCollateralValue?: number;
    loanToValueRatio?: number;
    tags?: string[];
    metadata?: Record<string, any>;
    internalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    version?: number;
    borrower: UserBasicInfoDto;
    documents?: LoanDocumentResponseDto[];
    collaterals?: CollateralResponseDto[];
    repaymentSchedule: RepaymentScheduleItemDto[];
    get progressPercentage(): number;
    get remainingMonths(): number | null;
    get isActive(): boolean;
    get isCompleted(): boolean;
    get isDefaulted(): boolean;
    get isApproved(): boolean;
    get isFunded(): boolean;
    get daysSinceDisbursement(): number | null;
    get daysUntilMaturity(): number | null;
    get totalRepayment(): number;
    get fundingProgress(): number;
    get isFullyFunded(): boolean;
    get canBeFunded(): boolean;
    get paymentsMade(): number;
    get paymentsRemaining(): number;
    get daysPastDue(): number;
    get isOverdue(): boolean;
    private getMonthDifference;
}
