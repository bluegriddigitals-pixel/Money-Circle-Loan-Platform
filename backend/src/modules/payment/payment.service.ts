import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
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
import { TransactionStatus, TransactionType } from './enums/transaction.enum';
import { EscrowAccountStatus, EscrowAccountType } from './enums/escrow.enum';
import { PaymentMethodStatus } from './enums/payment-method.enum';
import { PayoutRequestStatus, PayoutRequestType } from './enums/payout.enum';
import { DisbursementStatus } from './enums/disbursement.enum';

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
    private readonly userService: UserService,
  ) {}

  // ============================================
  // TRANSACTION METHODS
  // ============================================

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate transaction number
      const transactionNumber = `TXN-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        transactionNumber,
      });

      // If transaction is related to an escrow account, update the balance
      if (createTransactionDto.escrowAccountId) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
          where: { id: createTransactionDto.escrowAccountId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!escrowAccount) {
          throw new NotFoundException('Escrow account not found');
        }

        if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
          throw new BadRequestException('Escrow account is not active');
        }

        // Update escrow balance based on transaction type
        if (createTransactionDto.type === TransactionType.DEPOSIT) {
          if (createTransactionDto.amount <= 0) {
            throw new BadRequestException('Deposit amount must be positive');
          }
          escrowAccount.currentBalance += createTransactionDto.amount;
        } else if (createTransactionDto.type === TransactionType.WITHDRAWAL) {
          if (createTransactionDto.amount <= 0) {
            throw new BadRequestException('Withdrawal amount must be positive');
          }
          if (createTransactionDto.amount > escrowAccount.availableBalance) {
            throw new BadRequestException('Insufficient available balance');
          }
          escrowAccount.currentBalance -= createTransactionDto.amount;
        }

        await queryRunner.manager.save(escrowAccount);
      }

      const savedTransaction = await queryRunner.manager.save(transaction);

      // If payment method is specified, update its usage
      if (createTransactionDto.paymentMethodId) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
          where: { id: createTransactionDto.paymentMethodId },
        });

        if (paymentMethod) {
          paymentMethod.lastUsedAt = new Date();
          paymentMethod.recordTransaction(createTransactionDto.amount);
          await queryRunner.manager.save(paymentMethod);
        }
      }

      await queryRunner.commitTransaction();

      // Send notification
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

  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate payment method
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id: processPaymentDto.paymentMethodId },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      if (!paymentMethod.isActive) {
        throw new BadRequestException('Payment method is not active');
      }

      if (paymentMethod.isExpired) {
        throw new BadRequestException('Payment method has expired');
      }

      if (!paymentMethod.canProcessTransaction(processPaymentDto.amount)) {
        throw new BadRequestException('Transaction exceeds payment method limits');
      }

      // Process payment through external processor
      const processorResponse = await this.paymentProcessorService.processPayment({
        amount: processPaymentDto.amount,
        currency: processPaymentDto.currency || 'USD',
        paymentMethodId: paymentMethod.gatewayToken,
        customerId: paymentMethod.gatewayCustomerId,
        description: processPaymentDto.description,
        metadata: processPaymentDto.metadata,
      });

      // Create transaction record
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
      
      // Create failed transaction record
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
      const originalTransaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!originalTransaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (originalTransaction.status !== TransactionStatus.COMPLETED) {
        throw new BadRequestException('Only completed transactions can be refunded');
      }

      // Create refund transaction
      const refundTransaction = this.transactionRepository.create({
        transactionNumber: `REF-${originalTransaction.transactionNumber}`,
        loanId: originalTransaction.loanId,
        escrowAccountId: originalTransaction.escrowAccountId,
        paymentMethodId: originalTransaction.paymentMethodId,
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

      // Update original transaction status
      originalTransaction.status = TransactionStatus.REFUNDED;
      originalTransaction.metadata = {
        ...originalTransaction.metadata,
        refundedAt: new Date(),
        refundTransactionId: refundTransaction.id,
      };

      // If transaction was from escrow, return funds
      if (originalTransaction.escrowAccountId) {
        const escrowAccount = await this.escrowAccountRepository.findOne({
          where: { id: originalTransaction.escrowAccountId },
          lock: { mode: 'pessimistic_write' },
        });

        if (escrowAccount) {
          if (originalTransaction.type === TransactionType.WITHDRAWAL) {
            escrowAccount.currentBalance += originalTransaction.amount;
          } else if (originalTransaction.type === TransactionType.DEPOSIT) {
            escrowAccount.currentBalance -= originalTransaction.amount;
          }
          await queryRunner.manager.save(escrowAccount);
        }
      }

      await queryRunner.manager.save(originalTransaction);
      const savedRefundTransaction = await queryRunner.manager.save(refundTransaction);

      await queryRunner.commitTransaction();

      // Process refund through payment processor
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
          // Don't throw - we still recorded the refund internally
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

  // ============================================
  // ESCROW ACCOUNT METHODS
  // ============================================

  async createEscrowAccount(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount> {
    const escrowAccount = this.escrowAccountRepository.create(createEscrowAccountDto);
    
    // Set initial balance
    if (createEscrowAccountDto.initialAmount) {
      escrowAccount.currentBalance = createEscrowAccountDto.initialAmount;
    }

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
      where: { id: escrowAccountId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    // Check maximum balance limit
    if (escrowAccount.maximumBalance && (escrowAccount.currentBalance + amount) > escrowAccount.maximumBalance) {
      throw new BadRequestException('Deposit would exceed maximum balance limit');
    }

    // Create deposit transaction
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
      where: { id: escrowAccountId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    if (escrowAccount.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    if (amount > escrowAccount.availableBalance) {
      throw new BadRequestException('Insufficient available balance');
    }

    // Create withdrawal transaction
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

      const fromAccount = await this.escrowAccountRepository.findOne({
        where: { id: fromEscrowAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      const toAccount = await this.escrowAccountRepository.findOne({
        where: { id: toEscrowAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('One or both escrow accounts not found');
      }

      if (fromAccount.status !== EscrowAccountStatus.ACTIVE || toAccount.status !== EscrowAccountStatus.ACTIVE) {
        throw new BadRequestException('Both accounts must be active for transfer');
      }

      if (amount <= 0) {
        throw new BadRequestException('Transfer amount must be positive');
      }

      if (amount > fromAccount.availableBalance) {
        throw new BadRequestException('Insufficient available balance in source account');
      }

      // Create withdrawal from source
      const fromTransaction = this.transactionRepository.create({
        escrowAccountId: fromAccount.id,
        type: TransactionType.TRANSFER_OUT,
        status: TransactionStatus.COMPLETED,
        amount,
        currency: 'USD',
        description: description || `Transfer to ${toAccount.accountNumber}`,
        metadata: {
          transferTo: toAccount.id,
          transferType: 'internal',
        },
      });

      // Create deposit to destination
      const toTransaction = this.transactionRepository.create({
        escrowAccountId: toAccount.id,
        type: TransactionType.TRANSFER_IN,
        status: TransactionStatus.COMPLETED,
        amount,
        currency: 'USD',
        description: description || `Transfer from ${fromAccount.accountNumber}`,
        metadata: {
          transferFrom: fromAccount.id,
          transferType: 'internal',
        },
      });

      // Update balances
      fromAccount.currentBalance -= amount;
      toAccount.currentBalance += amount;

      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);
      await queryRunner.manager.save(fromTransaction);
      await queryRunner.manager.save(toTransaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Transferred ${amount} from ${fromAccount.accountNumber} to ${toAccount.accountNumber}`);
      return { fromTransaction, toTransaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to transfer funds: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to transfer funds');
    } finally {
      await queryRunner.release();
    }
  }

  async freezeEscrowAccount(escrowAccountId: string, reason: string): Promise<EscrowAccount> {
    const escrowAccount = await this.escrowAccountRepository.findOne({
      where: { id: escrowAccountId },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    escrowAccount.freeze(reason);
    const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

    this.logger.log(`Escrow account ${escrowAccount.accountNumber} frozen: ${reason}`);
    return updatedAccount;
  }

  async unfreezeEscrowAccount(escrowAccountId: string): Promise<EscrowAccount> {
    const escrowAccount = await this.escrowAccountRepository.findOne({
      where: { id: escrowAccountId },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    escrowAccount.unfreeze();
    const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

    this.logger.log(`Escrow account ${escrowAccount.accountNumber} unfrozen`);
    return updatedAccount;
  }

  async closeEscrowAccount(escrowAccountId: string, reason: string): Promise<EscrowAccount> {
    const escrowAccount = await this.escrowAccountRepository.findOne({
      where: { id: escrowAccountId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    if (escrowAccount.currentBalance > 0) {
      throw new BadRequestException('Cannot close account with positive balance');
    }

    escrowAccount.close(reason);
    const updatedAccount = await this.escrowAccountRepository.save(escrowAccount);

    this.logger.log(`Escrow account ${escrowAccount.accountNumber} closed: ${reason}`);
    return updatedAccount;
  }

  // ============================================
  // PAYMENT METHOD METHODS
  // ============================================

  async createPaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const existingMethods = await this.paymentMethodRepository.find({
      where: { userId: createPaymentMethodDto.userId },
    });

    // If this is the first payment method, set as default
    if (existingMethods.length === 0) {
      createPaymentMethodDto.isDefault = true;
    }

    const paymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
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
    const query = this.paymentMethodRepository.createQueryBuilder('method')
      .where('method.userId = :userId', { userId })
      .leftJoinAndSelect('method.user', 'user');

    if (!includeInactive) {
      query.andWhere('method.status IN (:...statuses)', {
        statuses: [PaymentMethodStatus.ACTIVE, PaymentMethodStatus.VERIFIED],
      });
    }

    query.orderBy('method.isDefault', 'DESC')
      .addOrderBy('method.createdAt', 'DESC');

    return query.getMany();
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get all user's payment methods
      const paymentMethods = await this.paymentMethodRepository.find({
        where: { userId },
      });

      // Find the method to set as default
      const methodToSet = paymentMethods.find(method => method.id === paymentMethodId);
      if (!methodToSet) {
        throw new NotFoundException('Payment method not found');
      }

      if (!methodToSet.isActive) {
        throw new BadRequestException('Cannot set inactive payment method as default');
      }

      // Remove default from all methods
      for (const method of paymentMethods) {
        if (method.isDefault) {
          method.isDefault = false;
          await queryRunner.manager.save(method);
        }
      }

      // Set new default
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

    paymentMethod.verify(verificationMethod);
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

  // ============================================
  // PAYOUT REQUEST METHODS
  // ============================================

  async createPayoutRequest(createPayoutRequestDto: CreatePayoutRequestDto): Promise<PayoutRequest> {
    // Validate escrow account if provided
    if (createPayoutRequestDto.escrowAccountId) {
      const escrowAccount = await this.escrowAccountRepository.findOne({
        where: { id: createPayoutRequestDto.escrowAccountId },
      });

      if (!escrowAccount) {
        throw new NotFoundException('Escrow account not found');
      }

      if (createPayoutRequestDto.amount > escrowAccount.availableBalance) {
        throw new BadRequestException('Requested amount exceeds available balance');
      }
    }

    const payoutRequest = this.payoutRequestRepository.create(createPayoutRequestDto);
    const savedRequest = await this.payoutRequestRepository.save(payoutRequest);

    // Send notification
    await this.notificationService.sendPayoutRequestNotification(savedRequest);

    this.logger.log(`Payout request ${savedRequest.requestNumber} created`);
    return savedRequest;
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

  async approvePayoutRequest(payoutRequestId: string, approvePayoutDto: ApprovePayoutDto): Promise<PayoutRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payoutRequest = await this.payoutRequestRepository.findOne({
        where: { id: payoutRequestId },
        lock: { mode: 'pessimistic_write' },
        relations: ['escrowAccount'],
      });

      if (!payoutRequest) {
        throw new NotFoundException('Payout request not found');
      }

      if (payoutRequest.status !== PayoutRequestStatus.PENDING) {
        throw new BadRequestException(`Cannot approve payout request with status: ${payoutRequest.status}`);
      }

      // If escrow account is specified, validate balance
      if (payoutRequest.escrowAccount) {
        if (payoutRequest.amount > payoutRequest.escrowAccount.availableBalance) {
          throw new BadRequestException('Requested amount exceeds available escrow balance');
        }
      }

      payoutRequest.approve(approvePayoutDto.approvedBy, approvePayoutDto.notes);
      await queryRunner.manager.save(payoutRequest);

      await queryRunner.commitTransaction();

      // Send notification
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

  async rejectPayoutRequest(payoutRequestId: string, rejectedBy: string, reason: string): Promise<PayoutRequest> {
    const payoutRequest = await this.payoutRequestRepository.findOne({
      where: { id: payoutRequestId },
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    payoutRequest.reject(rejectedBy, reason);
    const updatedRequest = await this.payoutRequestRepository.save(payoutRequest);

    // Send notification
    await this.notificationService.sendPayoutRejectionNotification(updatedRequest);

    this.logger.log(`Payout request ${payoutRequest.requestNumber} rejected: ${reason}`);
    return updatedRequest;
  }

  async processPayoutRequest(payoutRequestId: string): Promise<{ payoutRequest: PayoutRequest; transaction?: Transaction }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payoutRequest = await this.payoutRequestRepository.findOne({
        where: { id: payoutRequestId },
        lock: { mode: 'pessimistic_write' },
        relations: ['escrowAccount', 'user'],
      });

      if (!payoutRequest) {
        throw new NotFoundException('Payout request not found');
      }

      if (!payoutRequest.canBeProcessed) {
        throw new BadRequestException(`Payout request cannot be processed with status: ${payoutRequest.status}`);
      }

      let transaction: Transaction | undefined;

      // Start processing
      payoutRequest.startProcessing();
      await queryRunner.manager.save(payoutRequest);

      // If escrow account is involved, create withdrawal transaction
      if (payoutRequest.escrowAccount) {
        transaction = await this.withdrawFromEscrow(
          payoutRequest.escrowAccount.id,
          payoutRequest.amount,
          `Payout request ${payoutRequest.requestNumber}: ${payoutRequest.description || 'No description'}`
        );

        // Link transaction to payout request
        payoutRequest.metadata = {
          ...payoutRequest.metadata,
          transactionId: transaction.id,
        };
      }

      // Process through payment processor if needed
      if (payoutRequest.payoutMethod === 'bank_transfer' || payoutRequest.payoutMethod === 'wire_transfer') {
        try {
          const processorResponse = await this.paymentProcessorService.processPayout({
            amount: payoutRequest.netAmount,
            currency: 'USD',
            recipientDetails: {
              name: payoutRequest.recipientName,
              email: payoutRequest.recipientEmail,
              phone: payoutRequest.recipientPhone,
              ...payoutRequest.paymentDetails,
            },
            description: payoutRequest.description,
          });

          payoutRequest.transactionReference = processorResponse.transactionId;
          payoutRequest.metadata = {
            ...payoutRequest.metadata,
            processorResponse,
          };
        } catch (processorError) {
          this.logger.error(`Payment processor payout failed: ${processorError.message}`);
          payoutRequest.fail(`Payment processor error: ${processorError.message}`);
          await queryRunner.manager.save(payoutRequest);
          await queryRunner.commitTransaction();
          return { payoutRequest };
        }
      }

      // Complete the payout
      payoutRequest.complete(payoutRequest.transactionReference);
      await queryRunner.manager.save(payoutRequest);

      await queryRunner.commitTransaction();

      // Send notification
      await this.notificationService.sendPayoutCompletionNotification(payoutRequest);

      this.logger.log(`Payout request ${payoutRequest.requestNumber} processed successfully`);
      return { payoutRequest, transaction };
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
    // Validate loan exists
    const loan = await this.loanService.getLoanById(createDisbursementDto.loanId);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const disbursement = this.disbursementRepository.create(createDisbursementDto);
    const savedDisbursement = await this.disbursementRepository.save(disbursement);

    this.logger.log(`Disbursement ${savedDisbursement.disbursementNumber} created for loan ${loan.loanNumber}`);
    return savedDisbursement;
  }

  async getDisbursement(id: string): Promise<Disbursement> {
    const disbursement = await this.disbursementRepository.findOne({
      where: { id },
      relations: ['loan', 'escrowAccount', 'approver', 'canceller'],
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

    disbursement.scheduleDisbursement(scheduleDisbursementDto.scheduledDate);
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

    disbursement.approve(approvedBy, notes);
    const updatedDisbursement = await this.disbursementRepository.save(disbursement);

    // Send notification
    await this.notificationService.sendDisbursementApprovalNotification(updatedDisbursement);

    this.logger.log(`Disbursement ${disbursement.disbursementNumber} approved`);
    return updatedDisbursement;
  }

  async processDisbursement(disbursementId: string, amount?: number): Promise<{ disbursement: Disbursement; transaction?: Transaction }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const disbursement = await this.disbursementRepository.findOne({
        where: { id: disbursementId },
        lock: { mode: 'pessimistic_write' },
        relations: ['loan', 'escrowAccount'],
      });

      if (!disbursement) {
        throw new NotFoundException('Disbursement not found');
      }

      if (!disbursement.canBeProcessed) {
        throw new BadRequestException(`Disbursement cannot be processed with status: ${disbursement.status}`);
      }

      const disbursementAmount = amount || disbursement.pendingAmount;

      let transaction: Transaction | undefined;

      // If escrow account is involved, create withdrawal transaction
      if (disbursement.escrowAccount) {
        transaction = await this.withdrawFromEscrow(
          disbursement.escrowAccount.id,
          disbursementAmount,
          `Disbursement ${disbursement.disbursementNumber} for loan ${disbursement.loan?.loanNumber || disbursement.loanId}`
        );

        // Link transaction to disbursement
        disbursement.metadata = {
          ...disbursement.metadata,
          transactionId: transaction?.id,
        };
      }

      // Process the disbursement
      disbursement.disburse(disbursementAmount, transaction?.transactionReference);
      await queryRunner.manager.save(disbursement);

      // Update loan disbursed amount
      if (disbursement.loan) {
        await this.loanService.updateDisbursedAmount(disbursement.loanId, disbursementAmount);
      }

      await queryRunner.commitTransaction();

      // Send notification
      await this.notificationService.sendDisbursementNotification(disbursement);

      this.logger.log(`Disbursed ${disbursementAmount} for disbursement ${disbursement.disbursementNumber}`);
      return { disbursement, transaction };
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

    disbursement.createSchedule(installments);
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

    // Find disbursements scheduled for today
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
    // Find approved payout requests that are ready for processing
    const pendingPayouts = await this.payoutRequestRepository.find({
      where: {
        status: PayoutRequestStatus.APPROVED,
      },
      take: 100, // Process in batches
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

  // ============================================
  // UTILITY METHODS
  // ============================================

  async validatePaymentMethodForUser(userId: string, paymentMethodId: string): Promise<boolean> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, userId },
    });

    return !!paymentMethod && paymentMethod.isActive && !paymentMethod.isExpired;
  }

  async getAvailableBalance(escrowAccountId: string): Promise<number> {
    const escrowAccount = await this.escrowAccountRepository.findOne({
      where: { id: escrowAccountId },
    });

    if (!escrowAccount) {
      throw new NotFoundException('Escrow account not found');
    }

    return escrowAccount.availableBalance;
  }

  async calculateFees(amount: number, transactionType: string): Promise<{ processingFee: number; tax: number; totalFees: number }> {
    // Simple fee calculation logic - can be replaced with more complex rules
    const processingFee = Math.max(2.5, amount * 0.029); // 2.9% or $2.5 minimum
    const tax = processingFee * 0.1; // 10% tax on fees
    
    return {
      processingFee: Math.round(processingFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      totalFees: Math.round((processingFee + tax) * 100) / 100,
    };
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Check database connections
      const transactionCount = await this.transactionRepository.count();
      const escrowCount = await this.escrowAccountRepository.count();
      const paymentMethodCount = await this.paymentMethodRepository.count();
      const payoutCount = await this.payoutRequestRepository.count();
      const disbursementCount = await this.disbursementRepository.count();

      // Check payment processor connectivity
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