import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { EscrowAccount } from './entities/escrow-account.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { PaymentProcessorService } from './payment-processor.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateEscrowAccountDto } from './dto/create-escrow-account.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { CreateDisbursementDto } from './dto/create-disbursement.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { ScheduleDisbursementDto } from './dto/schedule-disbursement.dto';
import { TransactionStatus, TransactionType } from './enums/transaction.enum';
import { EscrowAccountType } from './enums/escrow.enum';
import { PayoutRequestStatus, PayoutRequestType } from './enums/payout.enum';
import { NotificationService } from '../notification/notification.service';
import { LoanService } from '../loan/loan.service';
import { UserService } from '../user/user.service';
export declare class PayoutService {
    private readonly transactionRepository;
    private readonly escrowAccountRepository;
    private readonly paymentMethodRepository;
    private readonly payoutRequestRepository;
    private readonly disbursementRepository;
    private readonly dataSource;
    private readonly paymentProcessorService;
    private readonly notificationService;
    private readonly loanService;
    private readonly userService;
    private readonly logger;
    constructor(transactionRepository: Repository<Transaction>, escrowAccountRepository: Repository<EscrowAccount>, paymentMethodRepository: Repository<PaymentMethod>, payoutRequestRepository: Repository<PayoutRequest>, disbursementRepository: Repository<Disbursement>, dataSource: DataSource, paymentProcessorService: PaymentProcessorService, notificationService: NotificationService, loanService: LoanService, userService: UserService);
    private generateTransactionNumber;
    private generateRequestNumber;
    private generateDisbursementNumber;
    private generateAccountNumber;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    getAllTransactions(page?: number, limit?: number): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserTransactions(userId: string): Promise<Transaction[]>;
    processPayment(processPaymentDto: ProcessPaymentDto): Promise<Transaction>;
    getTransaction(id: string): Promise<Transaction>;
    getTransactionsByLoan(loanId: string, filters?: {
        type?: TransactionType;
        status?: TransactionStatus;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
    refundTransaction(transactionId: string, reason?: string): Promise<Transaction>;
    refundPayment(data: {
        transactionId: string;
        amount?: number;
        reason?: string;
    }): Promise<Transaction>;
    createEscrowAccount(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount>;
    getEscrowAccount(id: string): Promise<EscrowAccount>;
    getEscrowByLoan(loanId: string): Promise<EscrowAccount[]>;
    getEscrowAccountByLoan(loanId: string, type?: EscrowAccountType): Promise<EscrowAccount[]>;
    depositToEscrow(escrowAccountId: string, amount: number, description?: string): Promise<Transaction>;
    withdrawFromEscrow(escrowAccountId: string, amount: number, description?: string): Promise<Transaction>;
    transferFunds(transferFundsDto: TransferFundsDto): Promise<{
        fromTransaction: Transaction;
        toTransaction: Transaction;
    }>;
    freezeEscrow(id: string, reason: string): Promise<EscrowAccount>;
    freezeEscrowAccount(escrowAccountId: string, reason: string): Promise<EscrowAccount>;
    unfreezeEscrow(id: string): Promise<EscrowAccount>;
    unfreezeEscrowAccount(escrowAccountId: string): Promise<EscrowAccount>;
    closeEscrow(id: string, reason: string): Promise<EscrowAccount>;
    closeEscrowAccount(escrowAccountId: string, reason: string): Promise<EscrowAccount>;
    createPaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod>;
    getPaymentMethod(id: string): Promise<PaymentMethod>;
    getUserPaymentMethods(userId: string, includeInactive?: boolean): Promise<PaymentMethod[]>;
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void>;
    verifyPaymentMethod(paymentMethodId: string, verificationMethod: string): Promise<PaymentMethod>;
    deactivatePaymentMethod(paymentMethodId: string, reason?: string): Promise<PaymentMethod>;
    removePaymentMethod(id: string, userId: string): Promise<PaymentMethod>;
    createPayoutRequest(createPayoutRequestDto: CreatePayoutRequestDto): Promise<PayoutRequest>;
    getAllPayouts(): Promise<PayoutRequest[]>;
    getUserPayouts(userId: string): Promise<PayoutRequest[]>;
    getPayoutRequest(id: string): Promise<PayoutRequest>;
    getUserPayoutRequests(userId: string, filters?: {
        status?: PayoutRequestStatus;
        type?: PayoutRequestType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<PayoutRequest[]>;
    approvePayout(id: string, approvedBy: string): Promise<PayoutRequest>;
    approvePayoutRequest(payoutRequestId: string, approvePayoutDto: ApprovePayoutDto): Promise<PayoutRequest>;
    rejectPayout(id: string, reason: string): Promise<PayoutRequest>;
    rejectPayoutRequest(payoutRequestId: string, rejectedBy: string, reason: string): Promise<PayoutRequest>;
    handleWebhook(provider: string, payload: any, signature: string): Promise<any>;
    processPayoutRequest(payoutRequestId: string): Promise<{
        payoutRequest: PayoutRequest;
        transaction?: Transaction;
    }>;
    getDisbursement(id: string): Promise<Disbursement>;
    getLoanDisbursements(loanId: string): Promise<Disbursement[]>;
    scheduleDisbursement(disbursementId: string, scheduleDisbursementDto: ScheduleDisbursementDto): Promise<Disbursement>;
    approveDisbursement(disbursementId: string, approvedBy: string, notes?: string): Promise<Disbursement>;
    createDisbursement(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement>;
    processDisbursement(disbursementId: string, amount?: number): Promise<{
        disbursement: Disbursement;
        transaction?: Transaction;
    }>;
    processScheduledDisbursements(): Promise<{
        processed: number;
        failed: number;
    }>;
    processPendingPayoutRequests(): Promise<{
        processed: number;
        failed: number;
    }>;
    getPaymentSummary(userId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
    getEscrowBalanceSummary(loanId?: string): Promise<any[]>;
    getPayoutStatistics(timeframe: 'day' | 'week' | 'month' | 'year'): Promise<any[]>;
    getPaymentStatistics(): Promise<any>;
    validatePaymentMethodForUser(userId: string, paymentMethodId: string): Promise<boolean>;
    getAvailableBalance(escrowAccountId: string): Promise<number>;
    getUserBalance(userId: string): Promise<{
        balance: number;
        currency: string;
    }>;
    calculateFees(amount: number, transactionType: string): Promise<{
        processingFee: number;
        tax: number;
        totalFees: number;
    }>;
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
