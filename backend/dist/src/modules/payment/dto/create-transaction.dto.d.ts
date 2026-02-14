import { TransactionType, TransactionStatus } from '../enums/transaction.enum';
export declare class CreateTransactionDto {
    loanId?: string;
    escrowAccountId?: string;
    paymentMethodId?: string;
    type: TransactionType;
    status?: TransactionStatus;
    amount: number;
    userId?: string;
    currency?: string;
    description?: string;
    transactionReference?: string;
    metadata?: Record<string, any>;
}
