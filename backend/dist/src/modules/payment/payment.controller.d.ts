import { PayoutService } from './payment.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateEscrowAccountDto } from './dto/create-escrow-account.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PayoutService);
    createTransaction(createTransactionDto: CreateTransactionDto, req: any): Promise<import("./entities/transaction.entity").Transaction>;
    getAllTransactions(page?: number, limit?: number): Promise<{
        data: import("./entities/transaction.entity").Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTransaction(id: string): Promise<import("./entities/transaction.entity").Transaction>;
    getUserTransactions(userId: string): Promise<import("./entities/transaction.entity").Transaction[]>;
    createEscrowAccount(createEscrowAccountDto: CreateEscrowAccountDto): Promise<import("./entities/escrow-account.entity").EscrowAccount>;
    getEscrowAccount(id: string): Promise<import("./entities/escrow-account.entity").EscrowAccount>;
    getEscrowByLoan(loanId: string): Promise<import("./entities/escrow-account.entity").EscrowAccount[]>;
    freezeEscrow(id: string, reason: string): Promise<import("./entities/escrow-account.entity").EscrowAccount>;
    unfreezeEscrow(id: string): Promise<import("./entities/escrow-account.entity").EscrowAccount>;
    closeEscrow(id: string, reason: string): Promise<import("./entities/escrow-account.entity").EscrowAccount>;
    processPayment(processPaymentDto: ProcessPaymentDto, req: any): Promise<import("./entities/transaction.entity").Transaction>;
    refundPayment(transactionId: string, amount?: number, reason?: string): Promise<import("./entities/transaction.entity").Transaction>;
    createPayoutRequest(createPayoutRequestDto: CreatePayoutRequestDto, req: any): Promise<import("./entities/payout-request.entity").PayoutRequest>;
    getAllPayouts(): Promise<import("./entities/payout-request.entity").PayoutRequest[]>;
    getUserPayouts(userId: string): Promise<import("./entities/payout-request.entity").PayoutRequest[]>;
    approvePayout(id: string, req: any): Promise<import("./entities/payout-request.entity").PayoutRequest>;
    processPayout(id: string): Promise<{
        payoutRequest: import("./entities/payout-request.entity").PayoutRequest;
        transaction?: import("./entities/transaction.entity").Transaction;
    }>;
    rejectPayout(id: string, reason: string): Promise<import("./entities/payout-request.entity").PayoutRequest>;
    createPaymentMethod(data: any, req: any): Promise<import("./entities/payment-method.entity").PaymentMethod>;
    getUserPaymentMethods(req: any): Promise<import("./entities/payment-method.entity").PaymentMethod[]>;
    removePaymentMethod(id: string, req: any): Promise<import("./entities/payment-method.entity").PaymentMethod>;
    handleWebhook(provider: string, payload: any, req: any): Promise<any>;
    getUserBalance(req: any): Promise<{
        balance: number;
        currency: string;
    }>;
    getPaymentStatistics(): Promise<any>;
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
