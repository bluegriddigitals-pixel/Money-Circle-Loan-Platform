import { PaymentMethodType } from '../enums/payment-method.enum';
export declare class CreatePaymentMethodDto {
    userId: string;
    type: PaymentMethodType;
    lastFour: string;
    holderName: string;
    expiryMonth?: number;
    expiryYear?: number;
    bankName?: string;
    gatewayToken?: string;
    gatewayCustomerId?: string;
    billingAddress?: Record<string, any>;
    isDefault?: boolean;
    metadata?: Record<string, any>;
}
