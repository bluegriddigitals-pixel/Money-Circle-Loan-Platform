"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const transaction_entity_1 = require("./entities/transaction.entity");
const escrow_account_entity_1 = require("./entities/escrow-account.entity");
const payment_method_entity_1 = require("./entities/payment-method.entity");
const payout_request_entity_1 = require("./entities/payout-request.entity");
const disbursement_entity_1 = require("./entities/disbursement.entity");
const payment_processor_service_1 = require("./payment-processor.service");
const common_2 = require("@nestjs/common");
const transaction_enum_1 = require("./enums/transaction.enum");
const escrow_enum_1 = require("./enums/escrow.enum");
const payment_method_enum_1 = require("./enums/payment-method.enum");
const payout_enum_1 = require("./enums/payout.enum");
const disbursement_enum_1 = require("./enums/disbursement.enum");
const notification_service_1 = require("../notification/notification.service");
const loan_service_1 = require("../loan/loan.service");
const user_service_1 = require("../user/user.service");
let PayoutService = PayoutService_1 = class PayoutService {
    constructor(transactionRepository, escrowAccountRepository, paymentMethodRepository, payoutRequestRepository, disbursementRepository, dataSource, paymentProcessorService, notificationService, loanService, userService) {
        this.transactionRepository = transactionRepository;
        this.escrowAccountRepository = escrowAccountRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.payoutRequestRepository = payoutRequestRepository;
        this.disbursementRepository = disbursementRepository;
        this.dataSource = dataSource;
        this.paymentProcessorService = paymentProcessorService;
        this.notificationService = notificationService;
        this.loanService = loanService;
        this.userService = userService;
        this.logger = new common_2.Logger(PayoutService_1.name);
    }
    generateTransactionNumber(prefix = 'TXN') {
        return `${prefix}-${new Date().getFullYear()}-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
    }
    generateRequestNumber() {
        return `PO-${new Date().getFullYear()}-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
    }
    generateDisbursementNumber() {
        return `DISB-${new Date().getFullYear()}-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
    }
    generateAccountNumber() {
        return `ESC-${new Date().getFullYear()}-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
    }
    async createTransaction(createTransactionDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transactionNumber = this.generateTransactionNumber();
            const transaction = new transaction_entity_1.Transaction();
            Object.assign(transaction, {
                ...createTransactionDto,
                transactionNumber,
                type: createTransactionDto.type,
                status: createTransactionDto.status || transaction_enum_1.TransactionStatus.PENDING,
            });
            if (createTransactionDto.escrowAccountId) {
                const escrowAccount = await this.escrowAccountRepository
                    .createQueryBuilder('escrow')
                    .setLock('pessimistic_write')
                    .where('escrow.id = :id', { id: createTransactionDto.escrowAccountId })
                    .getOne();
                if (!escrowAccount) {
                    throw new common_1.NotFoundException('Escrow account not found');
                }
                if (escrowAccount.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
                    throw new common_1.BadRequestException('Escrow account is not active');
                }
                if (createTransactionDto.type === transaction_enum_1.TransactionType.DEPOSIT) {
                    if (createTransactionDto.amount <= 0) {
                        throw new common_1.BadRequestException('Deposit amount must be positive');
                    }
                    escrowAccount.currentBalance += createTransactionDto.amount;
                }
                else if (createTransactionDto.type === transaction_enum_1.TransactionType.WITHDRAWAL) {
                    if (createTransactionDto.amount <= 0) {
                        throw new common_1.BadRequestException('Withdrawal amount must be positive');
                    }
                    if (createTransactionDto.amount > escrowAccount.availableBalance) {
                        throw new common_1.BadRequestException('Insufficient available balance');
                    }
                    escrowAccount.currentBalance -= createTransactionDto.amount;
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create transaction');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllTransactions(page = 1, limit = 10) {
        const [data, total] = await this.transactionRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['loan', 'escrowAccount', 'paymentMethod']
        });
        return { data, total, page, limit };
    }
    async getUserTransactions(userId) {
        return this.transactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            relations: ['loan', 'escrowAccount', 'paymentMethod']
        });
    }
    async processPayment(processPaymentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const paymentMethod = await this.paymentMethodRepository.findOne({
                where: { id: processPaymentDto.paymentMethodId },
            });
            if (!paymentMethod) {
                throw new common_1.NotFoundException('Payment method not found');
            }
            if (paymentMethod.status !== payment_method_enum_1.PaymentMethodStatus.ACTIVE && paymentMethod.status !== payment_method_enum_1.PaymentMethodStatus.VERIFIED) {
                throw new common_1.BadRequestException('Payment method is not active');
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
                type: transaction_enum_1.TransactionType.DEPOSIT,
                status: transaction_enum_1.TransactionStatus.COMPLETED,
                transactionReference: processorResponse.transactionId,
                metadata: {
                    ...processPaymentDto.metadata,
                    processorResponse,
                },
            });
            await queryRunner.commitTransaction();
            this.logger.log(`Payment processed successfully: ${processorResponse.transactionId}`);
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
            if (processPaymentDto.createFailedTransaction !== false) {
                await this.createTransaction({
                    ...processPaymentDto,
                    type: transaction_enum_1.TransactionType.DEPOSIT,
                    status: transaction_enum_1.TransactionStatus.FAILED,
                    metadata: {
                        ...processPaymentDto.metadata,
                        error: error.message,
                    },
                });
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTransaction(id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount', 'paymentMethod'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async getTransactionsByLoan(loanId, filters) {
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
    async refundTransaction(transactionId, reason) {
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
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (originalTransaction.status !== transaction_enum_1.TransactionStatus.COMPLETED) {
                throw new common_1.BadRequestException('Only completed transactions can be refunded');
            }
            const refundTransaction = new transaction_entity_1.Transaction();
            Object.assign(refundTransaction, {
                transactionNumber: `REF-${originalTransaction.transactionNumber}`,
                loanId: originalTransaction.loanId,
                escrowAccountId: originalTransaction.escrowAccountId,
                paymentMethodId: originalTransaction.paymentMethodId,
                userId: originalTransaction.userId,
                type: transaction_enum_1.TransactionType.REFUND,
                status: transaction_enum_1.TransactionStatus.PENDING,
                amount: originalTransaction.amount,
                currency: originalTransaction.currency,
                description: `Refund for ${originalTransaction.transactionNumber}: ${reason || 'No reason provided'}`,
                metadata: {
                    originalTransactionId: originalTransaction.id,
                    originalTransactionNumber: originalTransaction.transactionNumber,
                    refundReason: reason,
                },
            });
            originalTransaction.status = transaction_enum_1.TransactionStatus.REFUNDED;
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
                    if (originalTransaction.type === transaction_enum_1.TransactionType.WITHDRAWAL) {
                        escrowAccount.currentBalance = Number(escrowAccount.currentBalance) + Number(originalTransaction.amount);
                        escrowAccount.availableBalance = Number(escrowAccount.availableBalance) + Number(originalTransaction.amount);
                    }
                    else if (originalTransaction.type === transaction_enum_1.TransactionType.DEPOSIT) {
                        escrowAccount.currentBalance = Number(escrowAccount.currentBalance) - Number(originalTransaction.amount);
                        escrowAccount.availableBalance = Number(escrowAccount.availableBalance) - Number(originalTransaction.amount);
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
                    savedRefundTransaction.status = transaction_enum_1.TransactionStatus.COMPLETED;
                    savedRefundTransaction.metadata = {
                        ...savedRefundTransaction.metadata,
                        processorRefundedAt: new Date(),
                    };
                    await this.transactionRepository.save(savedRefundTransaction);
                }
                catch (processorError) {
                    this.logger.error(`Payment processor refund failed: ${processorError.message}`);
                }
            }
            this.logger.log(`Transaction ${originalTransaction.transactionNumber} refunded successfully`);
            return savedRefundTransaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to refund transaction: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to refund transaction');
        }
        finally {
            await queryRunner.release();
        }
    }
    async refundPayment(data) {
        return this.refundTransaction(data.transactionId, data.reason);
    }
    async createEscrowAccount(createEscrowAccountDto) {
        const escrowAccount = new escrow_account_entity_1.EscrowAccount();
        const accountNumber = this.generateAccountNumber();
        Object.assign(escrowAccount, {
            ...createEscrowAccountDto,
            accountNumber,
            currentBalance: createEscrowAccountDto.initialAmount || 0,
            status: escrow_enum_1.EscrowAccountStatus.ACTIVE
        });
        const savedAccount = await this.escrowAccountRepository.save(escrowAccount);
        this.logger.log(`Escrow account ${savedAccount.accountNumber} created successfully`);
        return savedAccount;
    }
    async getEscrowAccount(id) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id },
            relations: ['loan', 'transactions'],
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        return escrowAccount;
    }
    async getEscrowByLoan(loanId) {
        return this.getEscrowAccountByLoan(loanId);
    }
    async getEscrowAccountByLoan(loanId, type) {
        const query = this.escrowAccountRepository.createQueryBuilder('account')
            .where('account.loanId = :loanId', { loanId })
            .leftJoinAndSelect('account.transactions', 'transactions');
        if (type) {
            query.andWhere('account.type = :type', { type });
        }
        query.orderBy('account.createdAt', 'DESC');
        return query.getMany();
    }
    async depositToEscrow(escrowAccountId, amount, description) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Deposit amount must be positive');
        }
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId }
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        if (escrowAccount.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
            throw new common_1.BadRequestException('Escrow account is not active');
        }
        if (escrowAccount.maximumBalance && (escrowAccount.currentBalance + amount) > escrowAccount.maximumBalance) {
            throw new common_1.BadRequestException('Deposit would exceed maximum balance limit');
        }
        const transaction = await this.createTransaction({
            escrowAccountId,
            type: transaction_enum_1.TransactionType.DEPOSIT,
            status: transaction_enum_1.TransactionStatus.COMPLETED,
            amount,
            currency: 'USD',
            description: description || `Deposit to escrow account ${escrowAccount.accountNumber}`,
        });
        this.logger.log(`Deposited ${amount} to escrow account ${escrowAccount.accountNumber}`);
        return transaction;
    }
    async withdrawFromEscrow(escrowAccountId, amount, description) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Withdrawal amount must be positive');
        }
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId }
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        if (escrowAccount.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
            throw new common_1.BadRequestException('Escrow account is not active');
        }
        if (amount > escrowAccount.availableBalance) {
            throw new common_1.BadRequestException('Insufficient available balance');
        }
        const transaction = await this.createTransaction({
            escrowAccountId,
            type: transaction_enum_1.TransactionType.WITHDRAWAL,
            status: transaction_enum_1.TransactionStatus.COMPLETED,
            amount,
            currency: 'USD',
            description: description || `Withdrawal from escrow account ${escrowAccount.accountNumber}`,
        });
        this.logger.log(`Withdrew ${amount} from escrow account ${escrowAccount.accountNumber}`);
        return transaction;
    }
    async transferFunds(transferFundsDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { fromEscrowAccountId, toEscrowAccountId, amount, description } = transferFundsDto;
            if (fromEscrowAccountId === toEscrowAccountId) {
                throw new common_1.BadRequestException('Cannot transfer to the same account');
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
                throw new common_1.NotFoundException('One or both escrow accounts not found');
            }
            if (fromAccount.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE || toAccount.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
                throw new common_1.BadRequestException('Both accounts must be active for transfer');
            }
            if (amount <= 0) {
                throw new common_1.BadRequestException('Transfer amount must be positive');
            }
            if (amount > fromAccount.availableBalance) {
                throw new common_1.BadRequestException('Insufficient available balance in source account');
            }
            const fromTransaction = new transaction_entity_1.Transaction();
            Object.assign(fromTransaction, {
                escrowAccountId: fromAccount.id,
                type: transaction_enum_1.TransactionType.TRANSFER,
                status: transaction_enum_1.TransactionStatus.COMPLETED,
                amount,
                currency: 'USD',
                description: description || `Transfer to ${toAccount.accountNumber}`,
                metadata: {
                    transferTo: toAccount.id,
                    transferType: 'internal',
                    direction: 'OUT',
                },
            });
            const toTransaction = new transaction_entity_1.Transaction();
            Object.assign(toTransaction, {
                escrowAccountId: toAccount.id,
                type: transaction_enum_1.TransactionType.TRANSFER,
                status: transaction_enum_1.TransactionStatus.COMPLETED,
                amount,
                currency: 'USD',
                description: description || `Transfer from ${fromAccount.accountNumber}`,
                metadata: {
                    transferFrom: fromAccount.id,
                    transferType: 'internal',
                    direction: 'IN',
                },
            });
            fromAccount.currentBalance -= amount;
            toAccount.currentBalance += amount;
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to transfer funds: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to transfer funds');
        }
        finally {
            await queryRunner.release();
        }
    }
    async freezeEscrow(id, reason) {
        return this.freezeEscrowAccount(id, reason);
    }
    async freezeEscrowAccount(escrowAccountId, reason) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId },
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        escrowAccount.status = escrow_enum_1.EscrowAccountStatus.FROZEN;
        escrowAccount.frozenReason = reason;
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);
        this.logger.log(`Escrow account ${escrowAccount.accountNumber} frozen: ${reason}`);
        return updatedAccount;
    }
    async unfreezeEscrow(id) {
        return this.unfreezeEscrowAccount(id);
    }
    async unfreezeEscrowAccount(escrowAccountId) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId },
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        escrowAccount.status = escrow_enum_1.EscrowAccountStatus.ACTIVE;
        escrowAccount.frozenReason = null;
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);
        this.logger.log(`Escrow account ${escrowAccount.accountNumber} unfrozen`);
        return updatedAccount;
    }
    async closeEscrow(id, reason) {
        return this.closeEscrowAccount(id, reason);
    }
    async closeEscrowAccount(escrowAccountId, reason) {
        const escrowAccount = await this.escrowAccountRepository
            .createQueryBuilder('escrow')
            .setLock('pessimistic_write')
            .where('escrow.id = :id', { id: escrowAccountId })
            .getOne();
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        if (escrowAccount.currentBalance > 0) {
            throw new common_1.BadRequestException('Cannot close account with positive balance');
        }
        escrowAccount.status = escrow_enum_1.EscrowAccountStatus.CLOSED;
        escrowAccount.closedReason = reason;
        escrowAccount.closedAt = new Date();
        const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);
        this.logger.log(`Escrow account ${escrowAccount.accountNumber} closed: ${reason}`);
        return updatedAccount;
    }
    async createPaymentMethod(createPaymentMethodDto) {
        const existingMethods = await this.paymentMethodRepository.count({
            where: { userId: createPaymentMethodDto.userId },
        });
        const paymentMethod = new payment_method_entity_1.PaymentMethod();
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
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.PENDING;
        paymentMethod.isVerified = false;
        const savedMethod = await this.paymentMethodRepository.save(paymentMethod);
        this.logger.log(`Payment method created for user ${createPaymentMethodDto.userId}`);
        return savedMethod;
    }
    async getPaymentMethod(id) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        return paymentMethod;
    }
    async getUserPaymentMethods(userId, includeInactive = false) {
        const where = { userId };
        if (!includeInactive) {
            where.status = payment_method_enum_1.PaymentMethodStatus.ACTIVE || payment_method_enum_1.PaymentMethodStatus.VERIFIED;
        }
        return this.paymentMethodRepository.find({
            where,
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
    }
    async setDefaultPaymentMethod(userId, paymentMethodId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const paymentMethods = await this.paymentMethodRepository.find({
                where: { userId },
            });
            const methodToSet = paymentMethods.find(method => method.id === paymentMethodId);
            if (!methodToSet) {
                throw new common_1.NotFoundException('Payment method not found');
            }
            if (methodToSet.status !== payment_method_enum_1.PaymentMethodStatus.ACTIVE && methodToSet.status !== payment_method_enum_1.PaymentMethodStatus.VERIFIED) {
                throw new common_1.BadRequestException('Cannot set inactive payment method as default');
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to set default payment method: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async verifyPaymentMethod(paymentMethodId, verificationMethod) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.VERIFIED;
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
    async deactivatePaymentMethod(paymentMethodId, reason) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        if (paymentMethod.isDefault) {
            throw new common_1.BadRequestException('Cannot deactivate default payment method');
        }
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.INACTIVE;
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            deactivatedAt: new Date(),
            deactivationReason: reason,
        };
        const updatedMethod = await this.paymentMethodRepository.save(paymentMethod);
        this.logger.log(`Payment method ${paymentMethodId} deactivated: ${reason}`);
        return updatedMethod;
    }
    async removePaymentMethod(id, userId) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id, userId }
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        return this.deactivatePaymentMethod(id, 'Removed by user');
    }
    async createPayoutRequest(createPayoutRequestDto) {
        if (createPayoutRequestDto.escrowAccountId) {
            const escrowAccount = await this.escrowAccountRepository.findOne({
                where: { id: createPayoutRequestDto.escrowAccountId },
            });
            if (!escrowAccount) {
                throw new common_1.NotFoundException('Escrow account not found');
            }
            if (createPayoutRequestDto.amount > escrowAccount.availableBalance) {
                throw new common_1.BadRequestException('Requested amount exceeds available balance');
            }
        }
        const requestNumber = this.generateRequestNumber();
        const payoutRequest = new payout_request_entity_1.PayoutRequest();
        Object.assign(payoutRequest, {
            ...createPayoutRequestDto,
            requestNumber,
            status: payout_enum_1.PayoutRequestStatus.PENDING,
        });
        const savedRequest = await this.payoutRequestRepository.save(payoutRequest);
        await this.notificationService.sendPayoutRequestNotification(savedRequest);
        this.logger.log(`Payout request ${savedRequest.requestNumber} created`);
        return savedRequest;
    }
    async getAllPayouts() {
        return this.payoutRequestRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user', 'escrowAccount']
        });
    }
    async getUserPayouts(userId) {
        return this.getUserPayoutRequests(userId);
    }
    async getPayoutRequest(id) {
        const payoutRequest = await this.payoutRequestRepository.findOne({
            where: { id },
            relations: ['user', 'escrowAccount'],
        });
        if (!payoutRequest) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        return payoutRequest;
    }
    async getUserPayoutRequests(userId, filters) {
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
    async approvePayout(id, approvedBy) {
        return this.approvePayoutRequest(id, { approvedBy });
    }
    async approvePayoutRequest(payoutRequestId, approvePayoutDto) {
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
                throw new common_1.NotFoundException('Payout request not found');
            }
            if (payoutRequest.status !== payout_enum_1.PayoutRequestStatus.PENDING) {
                throw new common_1.BadRequestException(`Cannot approve payout request with status: ${payoutRequest.status}`);
            }
            if (payoutRequest.escrowAccount) {
                if (payoutRequest.amount > payoutRequest.escrowAccount.availableBalance) {
                    throw new common_1.BadRequestException('Requested amount exceeds available escrow balance');
                }
            }
            payoutRequest.status = payout_enum_1.PayoutRequestStatus.APPROVED;
            payoutRequest.approvedBy = approvePayoutDto.approvedBy;
            payoutRequest.approvedAt = new Date();
            payoutRequest.approvalNotes = approvePayoutDto.notes;
            await queryRunner.manager.save(payoutRequest);
            await queryRunner.commitTransaction();
            await this.notificationService.sendPayoutApprovalNotification(payoutRequest);
            this.logger.log(`Payout request ${payoutRequest.requestNumber} approved`);
            return payoutRequest;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to approve payout request: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async rejectPayout(id, reason) {
        return this.rejectPayoutRequest(id, 'system', reason);
    }
    async rejectPayoutRequest(payoutRequestId, rejectedBy, reason) {
        const payoutRequest = await this.payoutRequestRepository.findOne({
            where: { id: payoutRequestId },
        });
        if (!payoutRequest) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        payoutRequest.status = payout_enum_1.PayoutRequestStatus.REJECTED;
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
    async handleWebhook(provider, payload, signature) {
        this.logger.log(`Handling webhook from ${provider}`);
        try {
            const event = await this.paymentProcessorService.parseWebhookEvent(JSON.stringify(payload), signature);
            await this.paymentProcessorService.handleWebhookEvent(event);
            this.logger.debug(`Webhook processed: ${event.type || 'unknown'}`);
            return {
                received: true,
                provider,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error(`Webhook handling failed: ${error.message}`);
            throw new common_1.BadRequestException('Webhook processing failed');
        }
    }
    async processPayoutRequest(payoutRequestId) {
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
                throw new common_1.NotFoundException('Payout request not found');
            }
            if (payoutRequestToProcess.status !== payout_enum_1.PayoutRequestStatus.APPROVED) {
                throw new common_1.BadRequestException(`Payout request cannot be processed with status: ${payoutRequestToProcess.status}`);
            }
            let transaction;
            payoutRequestToProcess.status = payout_enum_1.PayoutRequestStatus.PROCESSING;
            await queryRunner.manager.save(payoutRequestToProcess);
            if (payoutRequestToProcess.escrowAccount) {
                transaction = await this.withdrawFromEscrow(payoutRequestToProcess.escrowAccount.id, payoutRequestToProcess.amount, `Payout request ${payoutRequestToProcess.requestNumber}: ${payoutRequestToProcess.description || 'No description'}`);
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
                }
                catch (processorError) {
                    this.logger.error(`Payment processor payout failed: ${processorError.message}`);
                    payoutRequestToProcess.status = payout_enum_1.PayoutRequestStatus.FAILED;
                    payoutRequestToProcess.failureReason = `Payment processor error: ${processorError.message}`;
                    await queryRunner.manager.save(payoutRequestToProcess);
                    await queryRunner.commitTransaction();
                    return { payoutRequest: payoutRequestToProcess };
                }
            }
            payoutRequestToProcess.status = payout_enum_1.PayoutRequestStatus.COMPLETED;
            await queryRunner.manager.save(payoutRequestToProcess);
            await queryRunner.commitTransaction();
            await this.notificationService.sendPayoutCompletionNotification(payoutRequestToProcess);
            this.logger.log(`Payout request ${payoutRequestToProcess.requestNumber} processed successfully`);
            return { payoutRequest: payoutRequestToProcess, transaction };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to process payout request: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getDisbursement(id) {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount', 'approver', 'canceller'],
        });
        if (!disbursement) {
            throw new common_1.NotFoundException('Disbursement not found');
        }
        return disbursement;
    }
    async getLoanDisbursements(loanId) {
        return this.disbursementRepository.find({
            where: { loanId },
            relations: ['escrowAccount'],
            order: { createdAt: 'DESC' },
        });
    }
    async scheduleDisbursement(disbursementId, scheduleDisbursementDto) {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id: disbursementId },
        });
        if (!disbursement) {
            throw new common_1.NotFoundException('Disbursement not found');
        }
        disbursement.status = disbursement_enum_1.DisbursementStatus.SCHEDULED;
        disbursement.scheduledDate = scheduleDisbursementDto.scheduledDate;
        const updatedDisbursement = await this.disbursementRepository.save(disbursement);
        this.logger.log(`Disbursement ${disbursement.disbursementNumber} scheduled for ${scheduleDisbursementDto.scheduledDate}`);
        return updatedDisbursement;
    }
    async approveDisbursement(disbursementId, approvedBy, notes) {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id: disbursementId },
        });
        if (!disbursement) {
            throw new common_1.NotFoundException('Disbursement not found');
        }
        disbursement.status = disbursement_enum_1.DisbursementStatus.APPROVED;
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
    async createDisbursement(createDisbursementDto) {
        const disbursementNumber = this.generateDisbursementNumber();
        const disbursement = new disbursement_entity_1.Disbursement();
        Object.assign(disbursement, {
            ...createDisbursementDto,
            disbursementNumber,
            status: disbursement_enum_1.DisbursementStatus.PENDING,
        });
        const savedDisbursement = await this.disbursementRepository.save(disbursement);
        this.logger.log(`Disbursement ${savedDisbursement.disbursementNumber} created`);
        return savedDisbursement;
    }
    async processDisbursement(disbursementId, amount) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const disbursementToProcess = await this.disbursementRepository
                .createQueryBuilder('disbursement')
                .setLock('pessimistic_write')
                .where('disbursement.id = :id', { id: disbursementId })
                .leftJoinAndSelect('disbursement.escrowAccount', 'escrowAccount')
                .getOne();
            if (!disbursementToProcess) {
                throw new common_1.NotFoundException('Disbursement not found');
            }
            if (disbursementToProcess.status !== disbursement_enum_1.DisbursementStatus.APPROVED &&
                disbursementToProcess.status !== disbursement_enum_1.DisbursementStatus.SCHEDULED) {
                throw new common_1.BadRequestException(`Disbursement cannot be processed with status: ${disbursementToProcess.status}`);
            }
            const pendingAmount = Number(disbursementToProcess.amount) - (Number(disbursementToProcess.disbursedAmount) || 0);
            const disbursementAmount = amount || pendingAmount;
            if (disbursementAmount > pendingAmount) {
                throw new common_1.BadRequestException(`Disbursement amount ${disbursementAmount} exceeds pending amount ${pendingAmount}`);
            }
            let transaction;
            if (disbursementToProcess.escrowAccount) {
                transaction = await this.withdrawFromEscrow(disbursementToProcess.escrowAccount.id, disbursementAmount, `Disbursement ${disbursementToProcess.disbursementNumber}`);
                disbursementToProcess.metadata = {
                    ...disbursementToProcess.metadata,
                    transactionId: transaction?.id,
                };
            }
            disbursementToProcess.disbursedAmount = (Number(disbursementToProcess.disbursedAmount) || 0) + disbursementAmount;
            disbursementToProcess.disbursedAt = new Date();
            disbursementToProcess.transactionReference = transaction?.transactionReference;
            if (Number(disbursementToProcess.disbursedAmount) >= Number(disbursementToProcess.amount)) {
                disbursementToProcess.status = disbursement_enum_1.DisbursementStatus.COMPLETED;
            }
            else {
                disbursementToProcess.status = disbursement_enum_1.DisbursementStatus.PARTIAL;
            }
            await queryRunner.manager.save(disbursementToProcess);
            await queryRunner.commitTransaction();
            await this.notificationService.sendDisbursementNotification(disbursementToProcess);
            this.logger.log(`Disbursed ${disbursementAmount} for disbursement ${disbursementToProcess.disbursementNumber}`);
            return { disbursement: disbursementToProcess, transaction };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to process disbursement: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async processScheduledDisbursements() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const scheduledDisbursements = await this.disbursementRepository.find({
            where: {
                status: disbursement_enum_1.DisbursementStatus.SCHEDULED,
                scheduledDate: (0, typeorm_2.Between)(today, tomorrow),
            },
        });
        let processed = 0;
        let failed = 0;
        for (const disbursement of scheduledDisbursements) {
            try {
                await this.processDisbursement(disbursement.id);
                processed++;
            }
            catch (error) {
                this.logger.error(`Failed to process scheduled disbursement ${disbursement.disbursementNumber}: ${error.message}`);
                failed++;
            }
        }
        this.logger.log(`Processed ${processed} scheduled disbursements, ${failed} failed`);
        return { processed, failed };
    }
    async processPendingPayoutRequests() {
        const pendingPayouts = await this.payoutRequestRepository.find({
            where: {
                status: payout_enum_1.PayoutRequestStatus.APPROVED,
            },
            take: 100,
        });
        let processed = 0;
        let failed = 0;
        for (const payout of pendingPayouts) {
            try {
                await this.processPayoutRequest(payout.id);
                processed++;
            }
            catch (error) {
                this.logger.error(`Failed to process payout request ${payout.requestNumber}: ${error.message}`);
                failed++;
            }
        }
        this.logger.log(`Processed ${processed} payout requests, ${failed} failed`);
        return { processed, failed };
    }
    async getPaymentSummary(userId, startDate, endDate) {
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
    async getEscrowBalanceSummary(loanId) {
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
    async getPayoutStatistics(timeframe) {
        const now = new Date();
        let startDate;
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
    async getPaymentStatistics() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const [totalTransactions, monthlyTransactions, yearlyVolume, successRate] = await Promise.all([
            this.transactionRepository.count(),
            this.transactionRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startOfMonth, now)
                }
            }),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amount)', 'total')
                .where('transaction.createdAt >= :startOfYear', { startOfYear })
                .andWhere('transaction.status = :status', { status: transaction_enum_1.TransactionStatus.COMPLETED })
                .getRawOne(),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('COUNT(CASE WHEN transaction.status = :completed THEN 1 END) * 100.0 / COUNT(*)', 'rate')
                .setParameter('completed', transaction_enum_1.TransactionStatus.COMPLETED)
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
    async validatePaymentMethodForUser(userId, paymentMethodId) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: paymentMethodId, userId },
        });
        return !!paymentMethod && (paymentMethod.status === payment_method_enum_1.PaymentMethodStatus.ACTIVE || paymentMethod.status === payment_method_enum_1.PaymentMethodStatus.VERIFIED);
    }
    async getAvailableBalance(escrowAccountId) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
            where: { id: escrowAccountId },
        });
        if (!escrowAccount) {
            throw new common_1.NotFoundException('Escrow account not found');
        }
        return escrowAccount.availableBalance;
    }
    async getUserBalance(userId) {
        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(CASE WHEN transaction.type IN (:...credits) THEN transaction.amount ELSE -transaction.amount END)', 'balance')
            .setParameter('credits', [transaction_enum_1.TransactionType.DEPOSIT, transaction_enum_1.TransactionType.REFUND])
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.status = :status', { status: transaction_enum_1.TransactionStatus.COMPLETED })
            .getRawOne();
        return {
            balance: Number(result?.balance) || 0,
            currency: 'USD'
        };
    }
    async calculateFees(amount, transactionType) {
        let feePercentage = 0.029;
        if (transactionType === 'WITHDRAWAL') {
            feePercentage = 0.025;
        }
        else if (transactionType === 'REFUND') {
            feePercentage = 0;
        }
        const processingFee = Math.max(2.5, amount * feePercentage);
        const tax = processingFee * 0.1;
        return {
            processingFee: Math.round(processingFee * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            totalFees: Math.round((processingFee + tax) * 100) / 100,
        };
    }
    async healthCheck() {
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
        }
        catch (error) {
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
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = PayoutService_1 = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(escrow_account_entity_1.EscrowAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_method_entity_1.PaymentMethod)),
    __param(3, (0, typeorm_1.InjectRepository)(payout_request_entity_1.PayoutRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(disbursement_entity_1.Disbursement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        payment_processor_service_1.PaymentProcessorService,
        notification_service_1.NotificationService,
        loan_service_1.LoanService,
        user_service_1.UserService])
], PayoutService);
//# sourceMappingURL=payment.service.js.map