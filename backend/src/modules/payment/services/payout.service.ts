import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

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

import { 
    TransactionStatus, 
    TransactionType 
} from './enums/transaction.enum';
import { 
    EscrowAccountStatus, 
    EscrowAccountType 
} from './enums/escrow.enum';
import { 
    PaymentMethodStatus 
} from './enums/payment-method.enum';
import { 
    PayoutRequestStatus, 
    PayoutRequestType 
} from './enums/payout.enum';
import { 
    DisbursementStatus 
} from './enums/disbursement.enum';

import { NotificationService } from '../notification/notification.service';
import { LoanService } from '../loan/loan.service';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(EscrowAccount)
        private readonly escrowAccountRepository: Repository<EscrowAccount>,
        @InjectRepository(PaymentMethod)
        private readonly paymentMethodRepository: Repository<PaymentMethod>,
        @InjectRepository(PayoutRequest)
        private readonly payoutRequestRepository: Repository<PayoutRequest>,
        @InjectRepository(Disbursement)
        private readonly disbursementRepository: Repository<Disbursement>,
        private readonly dataSource: DataSource,
        private readonly paymentProcessorService: PaymentProcessorService,
        private readonly notificationService: NotificationService,
        private readonly loanService: LoanService,
    ) { }

    // ============================================
    // UTILITY METHODS
    // ============================================

    private generateTransactionNumber(prefix: string = 'TXN'): string {
        return `${prefix}-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    }

    private generateRequestNumber(): string {
        return `PO-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    }

    private generateDisbursementNumber(): string {
        return `DISB-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    }

    private generateAccountNumber(): string {
        return `ESC-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    }

    // ============================================
    // TRANSACTION METHODS
    // ============================================

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const transactionNumber = this.generateTransactionNumber();

            const transaction = new Transaction();
            Object.assign(transaction, {
                ...createTransactionDto,
                transactionNumber,
                type: createTransactionDto.type,
                status: createTransactionDto.status || TransactionStatus.PENDING,
            });

            if (createTransactionDto.escrowAccountId) {
                const escrowAccount = await this.escrowAccountRepository
                    .createQueryBuilder('escrow')
                    .setLock('pessimistic_write')
                    .where('escrow.id = :id', { id: createTransactionDto.escrowAccountId })
                    .getOne();

                if (!escrowAccount) {
                    throw new NotFoundException('Escrow account not found');
                }

                if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
                    throw new BadRequestException('Escrow account is not active');
                }

                if (createTransactionDto.type === TransactionType.DEPOSIT) {
                    if (createTransactionDto.amount <= 0) {
                        throw new BadRequestException('Deposit amount must be positive');
                    }
                    escrowAccount.currentBalance = Number(escrowAccount.currentBalance) + createTransactionDto.amount;
                    escrowAccount.availableBalance = Number(escrowAccount.availableBalance) + createTransactionDto.amount;
                } else if (createTransactionDto.type === TransactionType.WITHDRAWAL) {
                    if (createTransactionDto.amount <= 0) {
                        throw new BadRequestException('Withdrawal amount must be positive');
                    }
                    if (createTransactionDto.amount > Number(escrowAccount.availableBalance)) {
                        throw new BadRequestException('Insufficient available balance');
                    }
                    escrowAccount.currentBalance = Number(escrowAccount.currentBalance) - createTransactionDto.amount;
                    escrowAccount.availableBalance = Number(escrowAccount.availableBalance) - createTransactionDto.amount;
                }

                await queryRunner.manager.save(escrowAccount);
            }

            const savedTransaction = await queryRunner.manager.save(transaction);

            if (createTransactionDto.paymentMethodId) {
                const paymentMethod = await this.paymentMethodRepository.findOne({
                    where: { id: createTransactionDto.paymentMethodId },
                });

                if (paymentMethod) {
                    paymentMethod.lastUsedAt = new Date();
                    await queryRunner.manager.save(paymentMethod);
                }
            }

            await queryRunner.commitTransaction();

            await this.notificationService.sendTransactionNotification(savedTransaction);

            this.logger.log(`Transaction ${savedTransaction.transactionNumber} created successfully`);
            return savedTransaction;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create transaction');
        } finally {
            await queryRunner.release();
        }
    }

    async getAllTransactions(page: number = 1, limit: number = 10): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.transactionRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['loan', 'escrowAccount', 'paymentMethod']
        });
        
        return { data, total, page, limit };
    }

    async getUserTransactions(userId: string): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            relations: ['loan', 'escrowAccount', 'paymentMethod']
        });
    }

    async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const paymentMethod = await this.paymentMethodRepository.findOne({
                where: { id: processPaymentDto.paymentMethodId },
            });

            if (!paymentMethod) {
                throw new NotFoundException('Payment method not found');
            }

            if (paymentMethod.status !== PaymentMethodStatus.ACTIVE && paymentMethod.status !== PaymentMethodStatus.VERIFIED) {
                throw new BadRequestException('Payment method is not active');
            }

            const processorResponse = await this.paymentProcessorService.processPayment({
                amount: processPaymentDto.amount,
                currency: processPaymentDto.currency || 'USD',
                paymentMethodId: paymentMethod.gatewayToken,
                customerId: paymentMethod.gatewayCustomerId,
                description: processPaymentDto.description,
                metadata: processPaymentDto.metadata,
            });

            const transaction = await this.createTransaction({
                ...processPaymentDto,
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.COMPLETED,
                transactionReference: processorResponse.transactionId,
                metadata: {
                    ...processPaymentDto.metadata,
                    processorResponse,
                },
            });

            await queryRunner.commitTransaction();

            this.logger.log(`Payment processed successfully: ${processorResponse.transactionId}`);
            return transaction;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Payment processing failed: ${error.message}`, error.stack);

            if (processPaymentDto.createFailedTransaction !== false) {
                await this.createTransaction({
                    ...processPaymentDto,
                    type: TransactionType.DEPOSIT,
                    status: TransactionStatus.FAILED,
                    metadata: {
                        ...processPaymentDto.metadata,
                        error: error.message,
                    },
                });
            }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getTransaction(id: string): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount', 'paymentMethod'],
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return transaction;
    }

    async getTransactionsByLoan(loanId: string, filters?: {
        type?: TransactionType;
        status?: TransactionStatus;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{ transactions: Transaction[]; total: number }> {
        const query = this.transactionRepository.createQueryBuilder('transaction')
            .where('transaction.loanId = :loanId', { loanId })
            .leftJoinAndSelect('transaction.escrowAccount', 'escrowAccount')
            .leftJoinAndSelect('transaction.paymentMethod', 'paymentMethod');

        if (filters?.type) {
            query.andWhere('transaction.type = :type', { type: filters.type });
        }

        if (filters?.status) {
            query.andWhere('transaction.status = :status', { status: filters.status });
        }

        if (filters?.startDate) {
            query.andWhere('transaction.createdAt >= :startDate', { startDate: filters.startDate });
        }

        if (filters?.endDate) {
            query.andWhere('transaction.createdAt <= :endDate', { endDate: filters.endDate });
        }

        const total = await query.getCount();

        if (filters?.limit) {
            query.take(filters.limit);
        }

        if (filters?.offset) {
            query.skip(filters.offset);
        }

        query.orderBy('transaction.createdAt', 'DESC');

        const transactions = await query.getMany();

        return { transactions, total };
    }

    async refundTransaction(transactionId: string, reason?: string): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const originalTransaction = await this.transactionRepository
                .createQueryBuilder('transaction')
                .setLock('pessimistic_write')
                .where('transaction.id = :id', { id: transactionId })
                .getOne();

            if (!originalTransaction) {
                throw new NotFoundException('Transaction not found');
            }

            if (originalTransaction.status !== TransactionStatus.COMPLETED) {
                throw new BadRequestException('Only completed transactions can be refunded');
            }

            const refundTransaction = new Transaction();
            Object.assign(refundTransaction, {
                transactionNumber: `REF-${originalTransaction.transactionNumber}`,
                loanId: originalTransaction.loanId,
                escrowAccountId: originalTransaction.escrowAccountId,
                paymentMethodId: originalTransaction.paymentMethodId,
                userId: originalTransaction.userId,
                type: TransactionType.REFUND,
                status: TransactionStatus.PENDING,
                amount: originalTransaction.amount,
                currency: originalTransaction.currency,
                description: `Refund for ${originalTransaction.transactionNumber}: ${reason || 'No reason provided'}`,
                metadata: {
                    originalTransactionId: originalTransaction.id,
                    originalTransactionNumber: originalTransaction.transactionNumber,
                    refundReason: reason,
                },
            });

            originalTransaction.status = TransactionStatus.REFUNDED;
            originalTransaction.metadata = {
                ...originalTransaction.metadata,
                refundedAt: new Date(),
                refundTransactionId: refundTransaction.id,
            };

            if (originalTransaction.escrowAccountId) {
                const escrowAccount = await this.escrowAccountRepository
                    .createQueryBuilder('escrow')
                    .setLock('pessimistic_write')
                    .where('escrow.id = :id', { id: originalTransaction.escrowAccountId })
                    .getOne();

                if (escrowAccount) {
                    if (originalTransaction.type === TransactionType.WITHDRAWAL) {
                        escrowAccount.currentBalance = Number(escrowAccount.currentBalance) + originalTransaction.amount;
                        escrowAccount.availableBalance = Number(escrowAccount.availableBalance) + originalTransaction.amount;
                    } else if (originalTransaction.type === TransactionType.DEPOSIT) {
                        escrowAccount.currentBalance = Number(escrowAccount.currentBalance) - originalTransaction.amount;
                        escrowAccount.availableBalance = Number(escrowAccount.availableBalance) - originalTransaction.amount;
                    }
                    await queryRunner.manager.save(escrowAccount);
                }
            }

            await queryRunner.manager.save(originalTransaction);
            const savedRefundTransaction = await queryRunner.manager.save(refundTransaction);

            await queryRunner.commitTransaction();

            if (originalTransaction.paymentMethodId) {
                try {
                    await this.paymentProcessorService.refundPayment({
                        originalTransactionId: originalTransaction.transactionReference,
                        amount: originalTransaction.amount,
                        reason,
                    });

                    savedRefundTransaction.status = TransactionStatus.COMPLETED;
                    savedRefundTransaction.metadata = {
                        ...savedRefundTransaction.metadata,
                        processorRefundedAt: new Date(),
                    };
                    await this.transactionRepository.save(savedRefundTransaction);
                } catch (processorError) {
                    this.logger.error(`Payment processor refund failed: ${processorError.message}`);
                }
            }

            this.logger.log(`Transaction ${originalTransaction.transactionNumber} refunded successfully`);
            return savedRefundTransaction;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to refund transaction: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to refund transaction');
        } finally {
            await queryRunner.release();
        }
    }

    async refundPayment(data: { transactionId: string; amount?: number; reason?: string }): Promise<Transaction> {
        return this.refundTransaction(data.transactionId, data.reason);
    }

    // ============================================
    // ESCROW ACCOUNT METHODS
    // ============================================

    async createEscrowAccount(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount> {
        const escrowAccount = new EscrowAccount();
        const accountNumber = this.generateAccountNumber();
        
        Object.assign(escrowAccount, {
            ...createEscrowAccountDto,
            accountNumber,
            currentBalance: createEscrowAccountDto.initialAmount || 0,
            availableBalance: createEscrowAccountDto.initialAmount || 0,
            status: EscrowAccountStatus.ACTIVE
        });

        const savedAccount = await this.escrowAccountRepository.save(escrowAccount);

        this.logger.log(`Escrow account ${savedAccount.accountNumber} created successfully`);
        return savedAccount;
    }

    async getEscrowAccount(id: string): Promise<EscrowAccount> {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id },
            relations: ['loan', 'transactions'],
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        return escrowAccount;
    }

    async getEscrowByLoan(loanId: string): Promise<EscrowAccount[]> {
        return this.getEscrowAccountByLoan(loanId);
    }

    async getEscrowAccountByLoan(loanId: string, type?: EscrowAccountType): Promise<EscrowAccount[]> {
        const query = this.escrowAccountRepository.createQueryBuilder('account')
            .where('account.loanId = :loanId', { loanId })
            .leftJoinAndSelect('account.transactions', 'transactions');

        if (type) {
            query.andWhere('account.type = :type', { type });
        }

        query.orderBy('account.createdAt', 'DESC');

        return query.getMany();
    }

    async depositToEscrow(escrowAccountId: string, amount: number, description?: string): Promise<Transaction> {
        if (amount <= 0) {
            throw new BadRequestException('Deposit amount must be positive');
        }

        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId }
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
            throw new BadRequestException('Escrow account is not active');
        }

        if (escrowAccount.maximumBalance && (Number(escrowAccount.currentBalance) + amount) > Number(escrowAccount.maximumBalance)) {
            throw new BadRequestException('Deposit would exceed maximum balance limit');
        }

        const transaction = await this.createTransaction({
            escrowAccountId,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED,
            amount,
            currency: 'USD',
            description: description || `Deposit to escrow account ${escrowAccount.accountNumber}`,
        });

        this.logger.log(`Deposited ${amount} to escrow account ${escrowAccount.accountNumber}`);
        return transaction;
    }

    async withdrawFromEscrow(escrowAccountId: string, amount: number, description?: string): Promise<Transaction> {
        if (amount <= 0) {
            throw new BadRequestException('Withdrawal amount must be positive');
        }

        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId }
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
            throw new BadRequestException('Escrow account is not active');
        }

        if (amount > Number(escrowAccount.availableBalance)) {
            throw new BadRequestException('Insufficient available balance');
        }

        const transaction = await this.createTransaction({
            escrowAccountId,
            type: TransactionType.WITHDRAWAL,
            status: TransactionStatus.COMPLETED,
            amount,
            currency: 'USD',
            description: description || `Withdrawal from escrow account ${escrowAccount.accountNumber}`,
        });

        this.logger.log(`Withdrew ${amount} from escrow account ${escrowAccount.accountNumber}`);
        return transaction;
    }

    async transferFunds(transferFundsDto: TransferFundsDto): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { fromEscrowAccountId, toEscrowAccountId, amount, description } = transferFundsDto;

            if (fromEscrowAccountId === toEscrowAccountId) {
                throw new BadRequestException('Cannot transfer to the same account');
            }

            const fromAccount = await this.escrowAccountRepository
                .createQueryBuilder('escrow')
                .setLock('pessimistic_write')
                .where('escrow.id = :id', { id: fromEscrowAccountId })
                .getOne();

            const toAccount = await this.escrowAccountRepository
                .createQueryBuilder('escrow')
                .setLock('pessimistic_write')
                .where('escrow.id = :id', { id: toEscrowAccountId })
                .getOne();

            if (!fromAccount || !toAccount) {
                throw new NotFoundException('One or both escrow accounts not found');
            }

            if (fromAccount.status !== EscrowAccountStatus.ACTIVE || toAccount.status !== EscrowAccountStatus.ACTIVE) {
                throw new BadRequestException('Both accounts must be active for transfer');
            }

            if (amount <= 0) {
                throw new BadRequestException('Transfer amount must be positive');
            }

            if (amount > Number(fromAccount.availableBalance)) {
                throw new BadRequestException('Insufficient available balance in source account');
            }

            const fromTransaction = new Transaction();
            Object.assign(fromTransaction, {
                escrowAccountId: fromAccount.id,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.COMPLETED,
                amount,
                currency: 'USD',
                description: description || `Transfer to ${toAccount.accountNumber}`,
                metadata: {
                    transferTo: toAccount.id,
                    transferType: 'internal',
                    direction: 'OUT',
                },
            });

            const toTransaction = new Transaction();
            Object.assign(toTransaction, {
                escrowAccountId: toAccount.id,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.COMPLETED,
                amount,
                currency: 'USD',
                description: description || `Transfer from ${fromAccount.accountNumber}`,
                metadata: {
                    transferFrom: fromAccount.id,
                    transferType: 'internal',
                    direction: 'IN',
                },
            });

            fromAccount.currentBalance = Number(fromAccount.currentBalance) - amount;
            fromAccount.availableBalance = Number(fromAccount.availableBalance) - amount;
            toAccount.currentBalance = Number(toAccount.currentBalance) + amount;
            toAccount.availableBalance = Number(toAccount.availableBalance) + amount;

            await queryRunner.manager.save(fromAccount);
            await queryRunner.manager.save(toAccount);

            const savedFromTransaction = await queryRunner.manager.save(fromTransaction);
            const savedToTransaction = await queryRunner.manager.save(toTransaction);

            await queryRunner.commitTransaction();

            this.logger.log(`Transferred ${amount} from ${fromAccount.accountNumber} to ${toAccount.accountNumber}`);

            return {
                fromTransaction: savedFromTransaction,
                toTransaction: savedToTransaction
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to transfer funds: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to transfer funds');
        } finally {
            await queryRunner.release();
        }
    }

    async freezeEscrow(id: string, reason: string): Promise<EscrowAccount> {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id },
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        escrowAccount.status = EscrowAccountStatus.FROZEN;
        escrowAccount.frozenReason = reason;
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

        this.logger.log(`Escrow account ${escrowAccount.accountNumber} frozen: ${reason}`);
        return updatedAccount;
    }

    async unfreezeEscrow(id: string): Promise<EscrowAccount> {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id },
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        escrowAccount.status = EscrowAccountStatus.ACTIVE;
        escrowAccount.frozenReason = null;
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

        this.logger.log(`Escrow account ${escrowAccount.accountNumber} unfrozen`);
        return updatedAccount;
    }

    async closeEscrow(id: string, reason: string): Promise<EscrowAccount> {
        const escrowAccount = await this.escrowAccountRepository
            .createQueryBuilder('escrow')
            .setLock('pessimistic_write')
            .where('escrow.id = :id', { id })
            .getOne();

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        if (Number(escrowAccount.currentBalance) > 0) {
            throw new BadRequestException('Cannot close account with positive balance');
        }

        escrowAccount.status = EscrowAccountStatus.CLOSED;
        escrowAccount.closedReason = reason;
        escrowAccount.closedAt = new Date();
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

        this.logger.log(`Escrow account ${escrowAccount.accountNumber} closed: ${reason}`);
        return updatedAccount;
    }

    // ============================================
    // PAYMENT METHOD METHODS
    // ============================================

    async createPaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
        const existingMethods = await this.paymentMethodRepository.count({
            where: { userId: createPaymentMethodDto.userId },
        });

        const paymentMethod = new PaymentMethod();
        
        paymentMethod.userId = createPaymentMethodDto.userId;
        paymentMethod.type = createPaymentMethodDto.type;
        paymentMethod.lastFour = createPaymentMethodDto.lastFour;
        paymentMethod.name = createPaymentMethodDto.holderName;
        paymentMethod.bankName = createPaymentMethodDto.bankName;
        paymentMethod.gatewayToken = createPaymentMethodDto.gatewayToken;
        paymentMethod.gatewayCustomerId = createPaymentMethodDto.gatewayCustomerId;
        paymentMethod.billingAddress = createPaymentMethodDto.billingAddress;
        paymentMethod.isDefault = existingMethods === 0 ? true : (createPaymentMethodDto.isDefault || false);
        paymentMethod.metadata = createPaymentMethodDto.metadata || {};
        paymentMethod.expiryMonth = createPaymentMethodDto.expiryMonth;
        paymentMethod.expiryYear = createPaymentMethodDto.expiryYear;
        paymentMethod.status = PaymentMethodStatus.PENDING;
        paymentMethod.isVerified = false;

        const savedMethod = await this.paymentMethodRepository.save(paymentMethod);

        this.logger.log(`Payment method created for user ${createPaymentMethodDto.userId}`);
        return savedMethod;
    }

    async getPaymentMethod(id: string): Promise<PaymentMethod> {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        return paymentMethod;
    }

    async getUserPaymentMethods(userId: string, includeInactive: boolean = false): Promise<PaymentMethod[]> {
        const where: FindOptionsWhere<PaymentMethod> = { userId };
        
        if (!includeInactive) {
            where.status = PaymentMethodStatus.ACTIVE;
        }

        return this.paymentMethodRepository.find({
            where,
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
    }

    async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const paymentMethods = await this.paymentMethodRepository.find({
                where: { userId },
            });

            const methodToSet = paymentMethods.find(method => method.id === paymentMethodId);
            if (!methodToSet) {
                throw new NotFoundException('Payment method not found');
            }

            if (methodToSet.status !== PaymentMethodStatus.ACTIVE && methodToSet.status !== PaymentMethodStatus.VERIFIED) {
                throw new BadRequestException('Cannot set inactive payment method as default');
            }

            for (const method of paymentMethods) {
                if (method.isDefault) {
                    method.isDefault = false;
                    await queryRunner.manager.save(method);
                }
            }

            methodToSet.isDefault = true;
            await queryRunner.manager.save(methodToSet);

            await queryRunner.commitTransaction();
            this.logger.log(`Set payment method ${paymentMethodId} as default for user ${userId}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to set default payment method: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async verifyPaymentMethod(paymentMethodId: string, verificationMethod: string): Promise<PaymentMethod> {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        paymentMethod.status = PaymentMethodStatus.VERIFIED;
        paymentMethod.isVerified = true;
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            verifiedAt: new Date(),
            verificationMethod,
        };
        
        const updatedMethod = await this.paymentMethodRepository.save(paymentMethod);

        this.logger.log(`Payment method ${paymentMethodId} verified using ${verificationMethod}`);
        return updatedMethod;
    }

    async deactivatePaymentMethod(paymentMethodId: string, reason?: string): Promise<PaymentMethod> {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        if (paymentMethod.isDefault) {
            throw new BadRequestException('Cannot deactivate default payment method');
        }

        paymentMethod.status = PaymentMethodStatus.INACTIVE;
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            deactivatedAt: new Date(),
            deactivationReason: reason,
        };

        const updatedMethod = await this.paymentMethodRepository.save(paymentMethod);

        this.logger.log(`Payment method ${paymentMethodId} deactivated: ${reason}`);
        return updatedMethod;
    }

    async removePaymentMethod(id: string, userId: string): Promise<PaymentMethod> {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id, userId }
        });
        
        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }
        
        return this.deactivatePaymentMethod(id, 'Removed by user');
    }

    // ============================================
    // PAYOUT REQUEST METHODS
    // ============================================

    async createPayoutRequest(createPayoutRequestDto: CreatePayoutRequestDto): Promise<PayoutRequest> {
        if (createPayoutRequestDto.escrowAccountId) {
            const escrowAccount = await this.escrowAccountRepository.findOne({
                where: { id: createPayoutRequestDto.escrowAccountId },
            });

            if (!escrowAccount) {
                throw new NotFoundException('Escrow account not found');
            }

            if (createPayoutRequestDto.amount > Number(escrowAccount.availableBalance)) {
                throw new BadRequestException('Requested amount exceeds available balance');
            }
        }

        const requestNumber = this.generateRequestNumber();

        const payoutRequest = new PayoutRequest();
        Object.assign(payoutRequest, {
            ...createPayoutRequestDto,
            requestNumber,
            status: PayoutRequestStatus.PENDING,
        });

        const savedRequest = await this.payoutRequestRepository.save(payoutRequest);

        await this.notificationService.sendPayoutRequestNotification(savedRequest);

        this.logger.log(`Payout request ${savedRequest.requestNumber} created`);
        return savedRequest;
    }

    async getAllPayouts(): Promise<PayoutRequest[]> {
        return this.payoutRequestRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user', 'escrowAccount']
        });
    }

    async getUserPayouts(userId: string): Promise<PayoutRequest[]> {
        return this.getUserPayoutRequests(userId);
    }

    async getPayoutRequest(id: string): Promise<PayoutRequest> {
        const payoutRequest = await this.payoutRequestRepository.findOne({
            where: { id },
            relations: ['user', 'escrowAccount'],
        });

        if (!payoutRequest) {
            throw new NotFoundException('Payout request not found');
        }

        return payoutRequest;
    }

    async getUserPayoutRequests(userId: string, filters?: {
        status?: PayoutRequestStatus;
        type?: PayoutRequestType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<PayoutRequest[]> {
        const query = this.payoutRequestRepository.createQueryBuilder('request')
            .where('request.userId = :userId', { userId })
            .leftJoinAndSelect('request.escrowAccount', 'escrowAccount');

        if (filters?.status) {
            query.andWhere('request.status = :status', { status: filters.status });
        }

        if (filters?.type) {
            query.andWhere('request.type = :type', { type: filters.type });
        }

        if (filters?.startDate) {
            query.andWhere('request.createdAt >= :startDate', { startDate: filters.startDate });
        }

        if (filters?.endDate) {
            query.andWhere('request.createdAt <= :endDate', { endDate: filters.endDate });
        }

        query.orderBy('request.createdAt', 'DESC');

        return query.getMany();
    }

    async approvePayout(id: string, approvedBy: string): Promise<PayoutRequest> {
        return this.approvePayoutRequest(id, { approvedBy });
    }

    async approvePayoutRequest(payoutRequestId: string, approvePayoutDto: ApprovePayoutDto): Promise<PayoutRequest> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const payoutRequest = await this.payoutRequestRepository
                .createQueryBuilder('payout')
                .setLock('pessimistic_write')
                .where('payout.id = :id', { id: payoutRequestId })
                .leftJoinAndSelect('payout.escrowAccount', 'escrowAccount')
                .getOne();

            if (!payoutRequest) {
                throw new NotFoundException('Payout request not found');
            }

            if (payoutRequest.status !== PayoutRequestStatus.PENDING) {
                throw new BadRequestException(`Cannot approve payout request with status: ${payoutRequest.status}`);
            }

            if (payoutRequest.escrowAccount) {
                if (payoutRequest.amount > Number(payoutRequest.escrowAccount.availableBalance)) {
                    throw new BadRequestException('Requested amount exceeds available escrow balance');
                }
            }

            payoutRequest.status = PayoutRequestStatus.APPROVED;
            payoutRequest.approvedBy = approvePayoutDto.approvedBy;
            payoutRequest.approvedAt = new Date();
            payoutRequest.approvalNotes = approvePayoutDto.notes;
            
            await queryRunner.manager.save(payoutRequest);

            await queryRunner.commitTransaction();

            await this.notificationService.sendPayoutApprovalNotification(payoutRequest);

            this.logger.log(`Payout request ${payoutRequest.requestNumber} approved`);
            return payoutRequest;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to approve payout request: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async rejectPayout(id: string, reason: string): Promise<PayoutRequest> {
        return this.rejectPayoutRequest(id, 'system', reason);
    }

    async rejectPayoutRequest(payoutRequestId: string, rejectedBy: string, reason: string): Promise<PayoutRequest> {
        const payoutRequest = await this.payoutRequestRepository.findOne({
            where: { id: payoutRequestId },
        });

        if (!payoutRequest) {
            throw new NotFoundException('Payout request not found');
        }

        payoutRequest.status = PayoutRequestStatus.REJECTED;
        payoutRequest.metadata = {
            ...payoutRequest.metadata,
            rejectedBy,
            rejectedAt: new Date(),
            rejectionReason: reason,
        };
        
        const updatedRequest = await this.payoutRequestRepository.save(payoutRequest);

        await this.notificationService.sendPayoutRejectionNotification(updatedRequest);

        this.logger.log(`Payout request ${payoutRequest.requestNumber} rejected: ${reason}`);
        return updatedRequest;
    }

    async processPayoutRequest(payoutRequestId: string): Promise<{ payoutRequest: PayoutRequest; transaction?: Transaction }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const payoutRequestToProcess = await this.payoutRequestRepository
                .createQueryBuilder('payout')
                .setLock('pessimistic_write')
                .where('payout.id = :id', { id: payoutRequestId })
                .leftJoinAndSelect('payout.escrowAccount', 'escrowAccount')
                .leftJoinAndSelect('payout.user', 'user')
                .getOne();

            if (!payoutRequestToProcess) {
                throw new NotFoundException('Payout request not found');
            }

            if (payoutRequestToProcess.status !== PayoutRequestStatus.APPROVED) {
                throw new BadRequestException(`Payout request cannot be processed with status: ${payoutRequestToProcess.status}`);
            }

            let transaction: Transaction | undefined;

            payoutRequestToProcess.status = PayoutRequestStatus.PROCESSING;
            await queryRunner.manager.save(payoutRequestToProcess);

            if (payoutRequestToProcess.escrowAccount) {
                transaction = await this.withdrawFromEscrow(
                    payoutRequestToProcess.escrowAccount.id,
                    payoutRequestToProcess.amount,
                    `Payout request ${payoutRequestToProcess.requestNumber}: ${payoutRequestToProcess.description || 'No description'}`
                );

                payoutRequestToProcess.metadata = {
                    ...payoutRequestToProcess.metadata,
                    transactionId: transaction.id,
                };
            }

            if (payoutRequestToProcess.payoutMethod === 'bank_transfer' || payoutRequestToProcess.payoutMethod === 'wire_transfer') {
                try {
                    const processorResponse = await this.paymentProcessorService.processPayout({
                        amount: payoutRequestToProcess.netAmount,
                        currency: 'USD',
                        recipientDetails: {
                            name: payoutRequestToProcess.recipientName,
                            email: payoutRequestToProcess.recipientEmail,
                            phone: payoutRequestToProcess.recipientPhone,
                            ...payoutRequestToProcess.paymentDetails,
                        },
                        description: payoutRequestToProcess.description,
                    });

                    payoutRequestToProcess.transactionReference = processorResponse.transactionId;
                    payoutRequestToProcess.metadata = {
                        ...payoutRequestToProcess.metadata,
                        processorResponse,
                    };
                } catch (processorError) {
                    this.logger.error(`Payment processor payout failed: ${processorError.message}`);
                    payoutRequestToProcess.status = PayoutRequestStatus.FAILED;
                    payoutRequestToProcess.failureReason = `Payment processor error: ${processorError.message}`;
                    await queryRunner.manager.save(payoutRequestToProcess);
                    await queryRunner.commitTransaction();
                    return { payoutRequest: payoutRequestToProcess };
                }
            }

            payoutRequestToProcess.status = PayoutRequestStatus.COMPLETED;
            await queryRunner.manager.save(payoutRequestToProcess);

            await queryRunner.commitTransaction();

            await this.notificationService.sendPayoutCompletionNotification(payoutRequestToProcess);

            this.logger.log(`Payout request ${payoutRequestToProcess.requestNumber} processed successfully`);
            return { payoutRequest: payoutRequestToProcess, transaction };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to process payout request: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // ============================================
    // DISBURSEMENT METHODS
    // ============================================

    async createDisbursement(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement> {
        const loan = await this.loanService.getLoanById(createDisbursementDto.loanId);
        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        const disbursementNumber = this.generateDisbursementNumber();

        const disbursement = new Disbursement();
        Object.assign(disbursement, {
            ...createDisbursementDto,
            disbursementNumber,
            status: DisbursementStatus.PENDING,
        });

        const savedDisbursement = await this.disbursementRepository.save(disbursement);

        this.logger.log(`Disbursement ${savedDisbursement.disbursementNumber} created for loan ${loan.loanNumber}`);
        return savedDisbursement;
    }

    async getDisbursement(id: string): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount'],
        });

        if (!disbursement) {
            throw new NotFoundException('Disbursement not found');
        }

        return disbursement;
    }

    async getLoanDisbursements(loanId: string): Promise<Disbursement[]> {
        return this.disbursementRepository.find({
            where: { loanId },
            relations: ['escrowAccount'],
            order: { createdAt: 'DESC' },
        });
    }

    async scheduleDisbursement(disbursementId: string, scheduleDisbursementDto: ScheduleDisbursementDto): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id: disbursementId },
        });

        if (!disbursement) {
            throw new NotFoundException('Disbursement not found');
        }

        disbursement.status = DisbursementStatus.SCHEDULED;
        disbursement.scheduledDate = scheduleDisbursementDto.scheduledDate;
        
        const updatedDisbursement = await this.disbursementRepository.save(disbursement);

        this.logger.log(`Disbursement ${disbursement.disbursementNumber} scheduled for ${scheduleDisbursementDto.scheduledDate}`);
        return updatedDisbursement;
    }

    async approveDisbursement(disbursementId: string, approvedBy: string, notes?: string): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id: disbursementId },
        });

        if (!disbursement) {
            throw new NotFoundException('Disbursement not found');
        }

        disbursement.status = DisbursementStatus.APPROVED;
        disbursement.approvedBy = approvedBy;
        disbursement.approvedAt = new Date();
        if (notes) {
            disbursement.approvalNotes = notes;
        }
        
        const updatedDisbursement = await this.disbursementRepository.save(disbursement);

        await this.notificationService.sendDisbursementApprovalNotification(updatedDisbursement);

        this.logger.log(`Disbursement ${disbursement.disbursementNumber} approved`);
        return updatedDisbursement;
    }

    async processDisbursement(disbursementId: string, amount?: number): Promise<{ disbursement: Disbursement; transaction?: Transaction }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const disbursementToProcess = await this.disbursementRepository
                .createQueryBuilder('disbursement')
                .setLock('pessimistic_write')
                .where('disbursement.id = :id', { id: disbursementId })
                .leftJoinAndSelect('disbursement.loan', 'loan')
                .leftJoinAndSelect('disbursement.escrowAccount', 'escrowAccount')
                .getOne();

            if (!disbursementToProcess) {
                throw new NotFoundException('Disbursement not found');
            }

            if (disbursementToProcess.status !== DisbursementStatus.APPROVED && 
                disbursementToProcess.status !== DisbursementStatus.SCHEDULED) {
                throw new BadRequestException(`Disbursement cannot be processed with status: ${disbursementToProcess.status}`);
            }

            const pendingAmount = Number(disbursementToProcess.amount) - (Number(disbursementToProcess.disbursedAmount) || 0);
            const disbursementAmount = amount || pendingAmount;

            if (disbursementAmount > pendingAmount) {
                throw new BadRequestException(`Disbursement amount ${disbursementAmount} exceeds pending amount ${pendingAmount}`);
            }

            let transaction: Transaction | undefined;

            if (disbursementToProcess.escrowAccount) {
                transaction = await this.withdrawFromEscrow(
                    disbursementToProcess.escrowAccount.id,
                    disbursementAmount,
                    `Disbursement ${disbursementToProcess.disbursementNumber} for loan ${disbursementToProcess.loan?.loanNumber || disbursementToProcess.loanId}`
                );

                disbursementToProcess.metadata = {
                    ...disbursementToProcess.metadata,
                    transactionId: transaction?.id,
                };
            }

            disbursementToProcess.disbursedAmount = (Number(disbursementToProcess.disbursedAmount) || 0) + disbursementAmount;
            disbursementToProcess.disbursedAt = new Date();
            disbursementToProcess.transactionReference = transaction?.transactionReference;
            
            if (Number(disbursementToProcess.disbursedAmount) >= Number(disbursementToProcess.amount)) {
                disbursementToProcess.status = DisbursementStatus.COMPLETED;
            } else {
                disbursementToProcess.status = DisbursementStatus.PARTIAL;
            }
            
            await queryRunner.manager.save(disbursementToProcess);

            if (disbursementToProcess.loan) {
                await this.loanService.updateDisbursedAmount(disbursementToProcess.loanId, disbursementAmount);
            }

            await queryRunner.commitTransaction();

            await this.notificationService.sendDisbursementNotification(disbursementToProcess);

            this.logger.log(`Disbursed ${disbursementAmount} for disbursement ${disbursementToProcess.disbursementNumber}`);
            return { disbursement: disbursementToProcess, transaction };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to process disbursement: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createDisbursementSchedule(disbursementId: string, installments: Array<{ amount: number; dueDate: Date }>): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id: disbursementId },
        });

        if (!disbursement) {
            throw new NotFoundException('Disbursement not found');
        }

        disbursement.schedule = installments.map((installment, index) => ({
            ...installment,
            status: index === 0 ? 'pending' : 'scheduled',
        }));
        
        const updatedDisbursement = await this.disbursementRepository.save(disbursement);

        this.logger.log(`Schedule created for disbursement ${disbursement.disbursementNumber} with ${installments.length} installments`);
        return updatedDisbursement;
    }

    // ============================================
    // BATCH PROCESSING METHODS
    // ============================================

    async processScheduledDisbursements(): Promise<{ processed: number; failed: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const scheduledDisbursements = await this.disbursementRepository.find({
            where: {
                status: DisbursementStatus.SCHEDULED,
                scheduledDate: Between(today, tomorrow),
            },
        });

        let processed = 0;
        let failed = 0;

        for (const disbursement of scheduledDisbursements) {
            try {
                await this.processDisbursement(disbursement.id);
                processed++;
            } catch (error) {
                this.logger.error(`Failed to process scheduled disbursement ${disbursement.disbursementNumber}: ${error.message}`);
                failed++;
            }
        }

        this.logger.log(`Processed ${processed} scheduled disbursements, ${failed} failed`);
        return { processed, failed };
    }

    async processPendingPayoutRequests(): Promise<{ processed: number; failed: number }> {
        const pendingPayouts = await this.payoutRequestRepository.find({
            where: {
                status: PayoutRequestStatus.APPROVED,
            },
            take: 100,
        });

        let processed = 0;
        let failed = 0;

        for (const payout of pendingPayouts) {
            try {
                await this.processPayoutRequest(payout.id);
                processed++;
            } catch (error) {
                this.logger.error(`Failed to process payout request ${payout.requestNumber}: ${error.message}`);
                failed++;
            }
        }

        this.logger.log(`Processed ${processed} payout requests, ${failed} failed`);
        return { processed, failed };
    }

    // ============================================
    // REPORTING METHODS
    // ============================================

    async getPaymentSummary(userId: string, startDate?: Date, endDate?: Date) {
        const query = this.transactionRepository.createQueryBuilder('transaction')
            .select('transaction.type', 'type')
            .addSelect('COUNT(transaction.id)', 'count')
            .addSelect('SUM(transaction.amount)', 'totalAmount')
            .where('transaction.userId = :userId', { userId });

        if (startDate) {
            query.andWhere('transaction.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            query.andWhere('transaction.createdAt <= :endDate', { endDate });
        }

        query.groupBy('transaction.type');

        return query.getRawMany();
    }

    async getEscrowBalanceSummary(loanId?: string) {
        const query = this.escrowAccountRepository.createQueryBuilder('account')
            .select('account.type', 'type')
            .addSelect('COUNT(account.id)', 'count')
            .addSelect('SUM(account.currentBalance)', 'totalBalance')
            .addSelect('SUM(account.availableBalance)', 'totalAvailableBalance');

        if (loanId) {
            query.where('account.loanId = :loanId', { loanId });
        }

        query.groupBy('account.type');

        return query.getRawMany();
    }

    async getPayoutStatistics(timeframe: 'day' | 'week' | 'month' | 'year') {
        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        const query = this.payoutRequestRepository.createQueryBuilder('payout')
            .select('payout.status', 'status')
            .addSelect('payout.type', 'type')
            .addSelect('COUNT(payout.id)', 'count')
            .addSelect('SUM(payout.amount)', 'totalAmount')
            .addSelect('SUM(payout.netAmount)', 'totalNetAmount')
            .where('payout.createdAt >= :startDate', { startDate })
            .groupBy('payout.status')
            .addGroupBy('payout.type');

        return query.getRawMany();
    }

    async getPaymentStatistics(): Promise<any> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const [
            totalTransactions,
            monthlyTransactions,
            yearlyVolume,
            successRate
        ] = await Promise.all([
            this.transactionRepository.count(),
            this.transactionRepository.count({
                where: {
                    createdAt: Between(startOfMonth, now)
                }
            }),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amount)', 'total')
                .where('transaction.createdAt >= :startOfYear', { startOfYear })
                .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
                .getRawOne(),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('COUNT(CASE WHEN transaction.status = :completed THEN 1 END) * 100.0 / COUNT(*)', 'rate')
                .setParameter('completed', TransactionStatus.COMPLETED)
                .getRawOne()
        ]);

        return {
            totalTransactions,
            monthlyTransactions,
            yearlyVolume: yearlyVolume?.total || 0,
            successRate: Math.round((successRate?.rate || 0) * 100) / 100,
            averageTransactionSize: totalTransactions > 0 
                ? (yearlyVolume?.total || 0) / totalTransactions 
                : 0
        };
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    async validatePaymentMethodForUser(userId: string, paymentMethodId: string): Promise<boolean> {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId, userId },
        });

        return !!paymentMethod && (paymentMethod.status === PaymentMethodStatus.ACTIVE || paymentMethod.status === PaymentMethodStatus.VERIFIED);
    }

    async getAvailableBalance(escrowAccountId: string): Promise<number> {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId },
        });

        if (!escrowAccount) {
            throw new NotFoundException('Escrow account not found');
        }

        return Number(escrowAccount.availableBalance);
    }

    async getUserBalance(userId: string): Promise<{ balance: number; currency: string }> {
        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(CASE WHEN transaction.type IN (:...credits) THEN transaction.amount ELSE -transaction.amount END)', 'balance')
            .setParameter('credits', [TransactionType.DEPOSIT, TransactionType.REFUND])
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
            .getRawOne();

        return {
            balance: Number(result?.balance) || 0,
            currency: 'USD'
        };
    }

    async calculateFees(amount: number, _transactionType: string): Promise<{ processingFee: number; tax: number; totalFees: number }> {
        const processingFee = Math.max(2.5, amount * 0.029);
        const tax = processingFee * 0.1;

        return {
            processingFee: Math.round(processingFee * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            totalFees: Math.round((processingFee + tax) * 100) / 100,
        };
    }

    async healthCheck(): Promise<{ status: string; details: any }> {
        try {
            const transactionCount = await this.transactionRepository.count();
            const escrowCount = await this.escrowAccountRepository.count();
            const paymentMethodCount = await this.paymentMethodRepository.count();
            const payoutCount = await this.payoutRequestRepository.count();
            const disbursementCount = await this.disbursementRepository.count();

            const processorStatus = await this.paymentProcessorService.healthCheck();

            return {
                status: 'healthy',
                details: {
                    database: {
                        transactions: transactionCount,
                        escrowAccounts: escrowCount,
                        paymentMethods: paymentMethodCount,
                        payoutRequests: payoutCount,
                        disbursements: disbursementCount,
                    },
                    paymentProcessor: processorStatus,
                    timestamp: new Date().toISOString(),
                },
            };
        } catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            return {
                status: 'unhealthy',
                details: {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                },
            };
        }
    }
}