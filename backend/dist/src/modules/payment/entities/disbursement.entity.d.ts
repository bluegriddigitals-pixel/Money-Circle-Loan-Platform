import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { DisbursementStatus } from '../enums/disbursement.enum';
export declare class Disbursement {
    id: string;
    disbursementNumber: string;
    loan: Loan;
    loanId: string;
    escrowAccount: EscrowAccount;
    escrowAccountId: string;
    amount: number;
    disbursedAmount: number;
    pendingAmount: number;
    currency: string;
    status: DisbursementStatus;
    scheduledDate: Date;
    disbursedAt: Date;
    approvedBy: string;
    approvedAt: Date;
    approvalNotes: string;
    cancelledBy: string;
    cancelledAt: Date;
    cancellationReason: string;
    failureReason: string;
    transactionReference: string;
    schedule: Array<{
        amount: number;
        dueDate: Date;
        status?: string;
    }>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
