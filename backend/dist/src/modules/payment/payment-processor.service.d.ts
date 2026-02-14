import { Logger } from '@nestjs/common';
export interface ProcessPaymentParams {
    amount: number;
    currency: string;
    paymentMethodId: string;
    customerId?: string;
    description?: string;
    metadata?: any;
}
export interface RefundPaymentParams {
    originalTransactionId: string;
    amount: number;
    reason?: string;
}
export interface ProcessPayoutParams {
    amount: number;
    currency: string;
    recipientDetails: any;
    description?: string;
}
export declare class PaymentProcessorService {
    readonly logger: Logger;
    processPayment(data: ProcessPaymentParams): Promise<{
        transactionId: string;
    }>;
    refundPayment(data: RefundPaymentParams): Promise<{
        refundId: string;
    }>;
    processPayout(data: ProcessPayoutParams): Promise<{
        transactionId: string;
    }>;
    healthCheck(): Promise<{
        status: string;
    }>;
    parseWebhookEvent(rawPayload: string, signature: string): Promise<any>;
    handleWebhookEvent(event: any): Promise<void>;
    tokenizePaymentMethod(data: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        holderName: string;
    }): Promise<any>;
    createCustomer(email: string): Promise<string>;
    simulatePayment(amount: number, success?: boolean): Promise<any>;
    simulatePayout(amount: number, success?: boolean): Promise<any>;
    private detectCardBrand;
}
