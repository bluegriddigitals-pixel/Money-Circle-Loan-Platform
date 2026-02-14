export declare class ProcessPaymentDto {
    paymentMethodId: string;
    amount: number;
    currency?: string;
    description?: string;
    loanId?: string;
    escrowAccountId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    createFailedTransaction?: boolean;
}
