import { Loan } from './loan.entity';
import { Transaction } from '../../payment/entities/transaction.entity';
export declare enum RepaymentStatus {
    PENDING = "pending",
    DUE = "due",
    PAID = "paid",
    PARTIALLY_PAID = "partially_paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled",
    WRITTEN_OFF = "written_off",
    IN_COLLECTION = "in_collection"
}
export declare enum PaymentMethod {
    BANK_TRANSFER = "bank_transfer",
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    E_WALLET = "e_wallet",
    DIRECT_DEBIT = "direct_debit",
    STANDING_ORDER = "standing_order",
    CASH = "cash",
    CHEQUE = "cheque",
    OTHER = "other"
}
export declare enum LateFeeType {
    FIXED = "fixed",
    PERCENTAGE = "percentage",
    DAILY = "daily",
    NONE = "none"
}
export declare class LoanRepayment {
    id: string;
    repaymentNumber: string;
    loanId: string;
    installmentNumber: number;
    totalInstallments: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmountDue: number;
    lateFeeAmount: number;
    penaltyInterestAmount: number;
    otherCharges: number;
    amountPaid: number;
    remainingBalance: number;
    status: RepaymentStatus;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    transactionId: string;
    paymentResponse: Record<string, any>;
    daysOverdue: number;
    gracePeriodDays: number;
    lateFeeType: LateFeeType;
    lateFeeRate: number;
    penaltyInterestRate: number;
    collectionStatus: string;
    collectionAgencyId: string;
    collectionActions: string[];
    writeOffDate: Date;
    writeOffReason: string;
    writeOffAmount: number;
    notes: string;
    internalNotes: string;
    bankConfirmationNumber: string;
    processorReference: string;
    settlementDate: Date;
    isDisputed: boolean;
    disputeStatus: string;
    disputeResolvedDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    version: number;
    metadata: Record<string, any>;
    loan: Loan;
    transaction: Transaction;
    get totalCharges(): number;
    get totalAmountDueWithCharges(): number;
    get paymentPercentage(): number;
    get isFullyPaid(): boolean;
    get isPartiallyPaid(): boolean;
    get isOverdue(): boolean;
    get isDue(): boolean;
    get isPending(): boolean;
    get daysUntilDue(): number;
    get isWithinGracePeriod(): boolean;
    get effectivePaymentDate(): Date;
    get principalPaid(): number;
    get interestPaid(): number;
    get chargesPaid(): number;
    get isWrittenOff(): boolean;
    get isInCollection(): boolean;
    get isCancelled(): boolean;
    beforeInsert(): Promise<void>;
    beforeUpdate(): Promise<void>;
    afterInsert(): Promise<void>;
    afterUpdate(): Promise<void>;
    private generateRepaymentNumber;
    private updateStatusBasedOnDueDate;
    private updateStatus;
    private calculateDaysOverdue;
    private calculateCharges;
    private calculateLateFee;
    private calculatePenaltyInterest;
    makePayment(amount: number, paymentMethod: PaymentMethod, paymentReference: string, transactionId?: string, notes?: string): void;
    markAsPaid(paymentMethod: PaymentMethod, paymentReference: string, transactionId?: string, notes?: string): void;
    markAsWrittenOff(reason: string, writeOffAmount?: number): void;
    markAsCancelled(): void;
    sendToCollection(collectionAgencyId: string): void;
    addCollectionAction(action: string): void;
    markDisputeResolved(resolution: string): void;
    getPaymentSummary(): {
        totalDue: number;
        amountPaid: number;
        remaining: number;
        status: string;
        dueDate: Date;
    };
    isPaymentLate(): boolean;
    getNextAction(): string;
    toJSON(): any;
    toString(): string;
}
