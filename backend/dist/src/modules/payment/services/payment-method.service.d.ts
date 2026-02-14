import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
export declare class PaymentMethodService {
    private readonly paymentMethodRepository;
    constructor(paymentMethodRepository: Repository<PaymentMethod>);
    create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod>;
    findOne(id: string): Promise<PaymentMethod>;
    findByUser(userId: string, includeInactive?: boolean): Promise<PaymentMethod[]>;
    setDefault(userId: string, paymentMethodId: string): Promise<PaymentMethod>;
    verify(id: string): Promise<PaymentMethod>;
    activate(id: string): Promise<PaymentMethod>;
    deactivate(id: string, reason?: string): Promise<PaymentMethod>;
    recordTransaction(id: string, amount: number): Promise<PaymentMethod>;
    getUserDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null>;
    getVerifiedMethods(userId: string): Promise<PaymentMethod[]>;
    update(id: string, updateData: Partial<PaymentMethod>): Promise<PaymentMethod>;
    delete(id: string): Promise<void>;
    restore(id: string): Promise<PaymentMethod>;
    getExpiringMethods(month: number, year: number): Promise<PaymentMethod[]>;
    getTransactionStats(id: string): Promise<any>;
}
