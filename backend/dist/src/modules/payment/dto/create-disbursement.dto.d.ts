import { DisbursementType, DisbursementMethod } from "../enums/disbursement.enum";
export declare class CreateDisbursementDto {
    loanId: string;
    escrowAccountId?: string;
    type: DisbursementType;
    amount: number;
    method: DisbursementMethod;
    recipientName: string;
    recipientEmail?: string;
    recipientPhone?: string;
    paymentDetails?: Record<string, any>;
    instructions?: string;
    scheduledDate?: Date;
    schedule?: Array<{
        amount: number;
        dueDate: Date;
    }>;
    supportingDocuments?: Array<{
        type: string;
        url: string;
        name: string;
    }>;
}
