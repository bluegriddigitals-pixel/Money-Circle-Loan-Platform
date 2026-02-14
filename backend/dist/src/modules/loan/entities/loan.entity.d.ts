import { User } from '../../user/entities/user.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanCollateral } from './loan-collateral.entity';
import { LoanDocument } from './loan-document.entity';
import { LoanGuarantor } from './loan-guarantor.entity';
import { LoanRepayment } from './loan-repayment.entity';
import { Disbursement } from '../../payment/entities/disbursement.entity';
import { EscrowAccount } from '../../payment/entities/escrow-account.entity';
import { Investment } from '../../marketplace/entities/investment.entity';
import { Transaction } from '../../payment/entities/transaction.entity';
export declare enum LoanStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    FUNDING = "funding",
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted",
    WRITTEN_OFF = "written_off",
    RESTRUCTURED = "restructured"
}
export declare enum LoanType {
    PERSONAL = "personal",
    BUSINESS = "business",
    EDUCATION = "education",
    HOME = "home",
    AUTO = "auto",
    DEBT_CONSOLIDATION = "debt_consolidation",
    PAYDAY = "payday",
    OTHER = "other"
}
export declare enum RepaymentFrequency {
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUALLY = "annually"
}
export declare class Loan {
    id: string;
    loanNumber: string;
    loanApplicationId: string;
    borrowerId: string;
    amount: number;
    tenureMonths: number;
    interestRate: number;
    type: LoanType;
    status: LoanStatus;
    purpose: string;
    repaymentFrequency: RepaymentFrequency;
    amountPaid: number;
    outstandingBalance: number;
    totalInterest: number;
    totalFees: number;
    monthlyInstallment: number;
    disbursementDate: Date;
    firstRepaymentDate: Date;
    lastRepaymentDate: Date;
    approvedAt: Date;
    approvedBy: string;
    rejectedAt: Date;
    rejectionReason: string;
    defaultedAt: Date;
    defaultReason: string;
    completedAt: Date;
    currency: string;
    gracePeriodDays: number;
    latePenaltyRate: number;
    latePenaltyAmount: number;
    latePaymentCount: number;
    missedPaymentCount: number;
    riskRating: string;
    creditScoreAtDisbursement: number;
    debtToIncomeRatio: number;
    collateralCoverageRatio: number;
    totalCollateralValue: number;
    loanToValueRatio: number;
    tags: string[];
    metadata: Record<string, any>;
    internalNotes: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    version: number;
    transactions: Transaction[];
    investments: Investment[];
    borrower: User;
    loanApplication: LoanApplication;
    collaterals: LoanCollateral[];
    documents: LoanDocument[];
    guarantors: LoanGuarantor[];
    repayments: LoanRepayment[];
    disbursements: Disbursement[];
    escrowAccounts: EscrowAccount[];
    beforeInsert(): Promise<void>;
    beforeUpdate(): Promise<void>;
    afterInsert(): Promise<void>;
    afterUpdate(): Promise<void>;
    private generateLoanNumber;
    private calculateMonthlyInstallment;
    private calculateOutstandingBalance;
    private updateLoanStatus;
    get progressPercentage(): number;
    get remainingMonths(): number | null;
    private getMonthDifference;
    get isActive(): boolean;
    get isCompleted(): boolean;
    get isDefaulted(): boolean;
    get isApproved(): boolean;
    get isFunded(): boolean;
    get daysSinceDisbursement(): number | null;
    get daysUntilMaturity(): number | null;
    approve(approvedBy: string): void;
    reject(reason: string, rejectedBy: string): void;
    disburse(disbursementDate?: Date): void;
    activate(): void;
    markAsDefaulted(reason: string): void;
    writeOff(): void;
    restructure(newAmount: number, newTenure: number, newRate: number): void;
    recordPayment(amount: number): void;
    addCollateral(collateral: LoanCollateral): void;
    removeCollateral(collateralId: string): void;
    private updateCollateralMetrics;
    getSummary(): {
        id: string;
        loanNumber: string;
        amount: number;
        outstandingBalance: number;
        monthlyInstallment: number;
        interestRate: number;
        status: LoanStatus;
        progress: number;
        nextPaymentDate?: Date;
    };
    toJSON(): Partial<Loan>;
}
