import { User } from '../../user/entities/user.entity';
export declare enum LoanStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    FUNDING = "funding",
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted"
}
export declare class Loan {
    id: string;
    loanNumber: string;
    borrower: User;
    borrowerId: string;
    amount: number;
    tenureMonths: number;
    interestRate: number;
    status: LoanStatus;
    purpose: string;
    amountPaid: number;
    outstandingBalance: number;
    disbursementDate: Date;
    firstRepaymentDate: Date;
    lastRepaymentDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
