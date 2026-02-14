import { User } from '../../user/entities/user.entity';
import { Transaction } from './transaction.entity';
import { PaymentMethodStatus, PaymentMethodType } from '../enums/payment-method.enum';
export declare class PaymentMethod {
    id: string;
    user: User;
    userId: string;
    type: PaymentMethodType;
    lastFour: string;
    name: string;
    bankName: string;
    gatewayToken: string;
    gatewayCustomerId: string;
    isDefault: boolean;
    billingAddress: any;
    metadata: any;
    expiryMonth: number;
    expiryYear: number;
    status: PaymentMethodStatus;
    isVerified: boolean;
    lastUsedAt: Date;
    transactions: Transaction[];
    createdAt: Date;
    updatedAt: Date;
}
