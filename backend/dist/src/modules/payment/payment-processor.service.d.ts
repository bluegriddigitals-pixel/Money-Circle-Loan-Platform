import { ConfigService } from '@nestjs/config';
export declare class PaymentProcessorService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    processPayment(data: {
        amount: number;
        currency: string;
        paymentMethodId: string;
        customerId?: string;
        description?: string;
        metadata?: any;
    }): Promise<{
        transactionId: string;
        status: string;
    }>;
    processPayout(data: {
        amount: number;
        currency: string;
        recipientDetails: any;
        description?: string;
    }): Promise<{
        transactionId: string;
        status: string;
    }>;
    refundPayment(data: {
        originalTransactionId: string;
        amount?: number;
        reason?: string;
    }): Promise<{
        refundId: string;
        status: string;
    }>;
    verifyPaymentMethod(data: {
        paymentMethodId: string;
        customerId?: string;
    }): Promise<{
        verified: boolean;
        details?: any;
    }>;
    parseWebhookEvent(payload: any, signature?: string, secret?: string): Promise<any>;
    handleWebhookEvent(event: any): Promise<{
        received: boolean;
        handled: boolean;
    }>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
