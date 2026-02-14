import { PayoutRequestType, PayoutMethod } from '../enums/payout.enum';
export declare class CreatePayoutRequestDto {
    userId: string;
    escrowAccountId?: string;
    type: PayoutRequestType;
    amount: number;
    payoutMethod: PayoutMethod;
    recipientName: string;
    recipientEmail?: string;
    recipientPhone?: string;
    paymentDetails?: Record<string, any>;
    description?: string;
    internalReference?: string;
    metadata?: Record<string, any>;
    supportingDocuments?: Array<{
        type: string;
        url: string;
        name: string;
    }>;
}
