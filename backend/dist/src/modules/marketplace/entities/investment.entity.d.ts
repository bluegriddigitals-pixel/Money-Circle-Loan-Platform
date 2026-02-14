import { User } from '../../user/entities/user.entity';
import { Loan } from '../../loan/entities/loan.entity';
export declare enum InvestmentStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted",
    CANCELLED = "cancelled"
}
export declare enum InvestmentType {
    MANUAL = "manual",
    AUTO = "auto"
}
export declare class Investment {
    id: string;
    investmentNumber: string;
    investorId: string;
    loanId: string;
    amount: number;
    currency: string;
    interestRate: number;
    status: InvestmentStatus;
    type: InvestmentType;
    investmentDate: Date;
    maturityDate: Date;
    expectedReturn: number;
    amountReturned: number;
    remainingBalance: number;
    cancelledAt: Date;
    cancellationReason: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    investor: User;
    loan: Loan;
    generateInvestmentNumber(): void;
    private getMonthDifference;
    get roi(): number;
    get progressPercentage(): number;
    get isActive(): boolean;
    get isCompleted(): boolean;
    recordReturn(amount: number): void;
    cancel(reason: string): void;
    toJSON(): Partial<Investment>;
}
