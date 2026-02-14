import { Loan } from '../../loan/entities/loan.entity';
import { Transaction } from './transaction.entity';
import { EscrowAccountStatus, EscrowAccountType } from '../enums/escrow.enum';
export declare class EscrowAccount {
    id: string;
    accountNumber: string;
    loan: Loan;
    loanId: string;
    type: EscrowAccountType;
    currentBalance: number;
    availableBalance: number;
    maximumBalance: number;
    minimumBalance: number;
    status: EscrowAccountStatus;
    frozenReason: string;
    closedReason: string;
    closedAt: Date;
    releasedAt: Date;
    releasedTo: string;
    transactions: Transaction[];
    createdAt: Date;
    updatedAt: Date;
}
