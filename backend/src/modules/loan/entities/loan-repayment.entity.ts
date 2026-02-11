import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsObject,
  MaxLength,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from './loan.entity';
import { Transaction } from '../../payment/entities/transaction.entity';

export enum RepaymentStatus {
  PENDING = 'pending',
  DUE = 'due',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  WRITTEN_OFF = 'written_off',
  IN_COLLECTION = 'in_collection',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  E_WALLET = 'e_wallet',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  CASH = 'cash',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

export enum LateFeeType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  DAILY = 'daily',
  NONE = 'none',
}

@Entity('loan_repayments')
@Index(['loanId'])
@Index(['dueDate'])
@Index(['status'])
@Index(['installmentNumber'])
@Index(['transactionId'], { unique: true, where: 'transaction_id IS NOT NULL' })
@Index(['paymentDate'])
export class LoanRepayment {
  @ApiProperty({
    description: 'Unique identifier for the loan repayment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique repayment reference number',
    example: 'REP-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  repaymentNumber: string;

  @ApiProperty({
    description: 'ID of the loan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  loanId: string;

  @ApiProperty({
    description: 'Installment number (e.g., 1 for first payment)',
    example: 1,
    minimum: 1,
  })
  @Column({ type: 'integer', nullable: false })
  @IsInt()
  @Min(1)
  installmentNumber: number;

  @ApiProperty({
    description: 'Total number of installments',
    example: 24,
    minimum: 1,
  })
  @Column({ type: 'integer', nullable: false })
  @IsInt()
  @Min(1)
  totalInstallments: number;

  @ApiProperty({
    description: 'Due date for this repayment',
    example: '2024-02-15',
  })
  @Column({ type: 'date', nullable: false })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({
    description: 'Principal amount due',
    example: 2000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  principalAmount: number;

  @ApiProperty({
    description: 'Interest amount due',
    example: 150.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  interestAmount: number;

  @ApiProperty({
    description: 'Total amount due (principal + interest)',
    example: 2150.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  totalAmountDue: number;

  @ApiPropertyOptional({
    description: 'Late fee amount',
    example: 50.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount: number;

  @ApiPropertyOptional({
    description: 'Penalty interest amount',
    example: 25.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyInterestAmount: number;

  @ApiPropertyOptional({
    description: 'Other charges/fees',
    example: 10.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCharges: number;

  @ApiProperty({
    description: 'Total amount paid',
    example: 2150.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({
    description: 'Remaining balance',
    example: 0.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  remainingBalance: number;

  @ApiProperty({
    description: 'Repayment status',
    enum: RepaymentStatus,
    example: RepaymentStatus.PENDING,
    default: RepaymentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: RepaymentStatus,
    default: RepaymentStatus.PENDING,
    nullable: false,
  })
  @IsEnum(RepaymentStatus)
  status: RepaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment date',
    example: '2024-02-15',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiPropertyOptional({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment reference/transaction ID',
    example: 'TXN123456789',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentReference: string;

  @ApiPropertyOptional({
    description: 'ID of the transaction record',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Payment gateway response',
    example: { authorization_code: 'AUTH123', gateway_id: 'GW789' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  paymentResponse: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Days overdue',
    example: 0,
    minimum: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsInt()
  @Min(0)
  daysOverdue: number;

  @ApiPropertyOptional({
    description: 'Grace period in days',
    example: 7,
    minimum: 0,
    default: 7,
  })
  @Column({ type: 'integer', default: 7, nullable: false })
  @IsInt()
  @Min(0)
  gracePeriodDays: number;

  @ApiPropertyOptional({
    description: 'Late fee type',
    enum: LateFeeType,
    example: LateFeeType.FIXED,
    default: LateFeeType.FIXED,
  })
  @Column({
    type: 'enum',
    enum: LateFeeType,
    default: LateFeeType.FIXED,
    nullable: false,
  })
  @IsEnum(LateFeeType)
  lateFeeType: LateFeeType;

  @ApiPropertyOptional({
    description: 'Late fee rate/amount',
    example: 50.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeRate: number;

  @ApiPropertyOptional({
    description: 'Penalty interest rate (annual)',
    example: 5.0,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyInterestRate: number;

  @ApiPropertyOptional({
    description: 'Collection status',
    example: 'not_started',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  collectionStatus: string;

  @ApiPropertyOptional({
    description: 'Collection agency ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  collectionAgencyId: string;

  @ApiPropertyOptional({
    description: 'Collection actions taken',
    example: ['email_reminder', 'sms_reminder', 'phone_call'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  collectionActions: string[];

  @ApiPropertyOptional({
    description: 'Write-off date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  writeOffDate: Date;

  @ApiPropertyOptional({
    description: 'Write-off reason',
    example: 'Uncollectible debt',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  writeOffReason: string;

  @ApiPropertyOptional({
    description: 'Write-off amount',
    example: 2150.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  writeOffAmount: number;

  @ApiPropertyOptional({
    description: 'Notes/comments',
    example: 'Payment received via bank transfer',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Payment processed with 2-day delay due to bank holiday',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiPropertyOptional({
    description: 'Payment confirmation number from bank',
    example: 'BANK123456789',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  bankConfirmationNumber: string;

  @ApiPropertyOptional({
    description: 'Payment processor reference',
    example: 'PP123456789',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  processorReference: string;

  @ApiPropertyOptional({
    description: 'Payment settlement date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  settlementDate: Date;

  @ApiPropertyOptional({
    description: 'Whether payment is disputed',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isDisputed: boolean;

  @ApiPropertyOptional({
    description: 'Dispute resolution status',
    example: 'resolved',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  disputeStatus: string;

  @ApiPropertyOptional({
    description: 'Dispute resolution date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  disputeResolvedDate: Date;

  @ApiProperty({
    description: 'Repayment creation timestamp',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    readOnly: true,
  })
  @UpdateDateColumn({ type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;

  @ApiPropertyOptional({
    description: 'Version for optimistic locking',
    example: 1,
    default: 1,
  })
  @Column({ type: 'integer', default: 1, nullable: false })
  @IsInt()
  @Min(1)
  version: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  // Relations
  @ApiPropertyOptional({
    description: 'Loan associated with this repayment',
    type: () => Loan,
  })
  @ManyToOne(() => Loan, (loan) => loan.repayments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'loanId' })
  @ValidateNested()
  @Type(() => Loan)
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Transaction record for this payment',
    type: () => Transaction,
  })
  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  @ValidateNested()
  @Type(() => Transaction)
  transaction: Transaction;

  // Computed properties
  @ApiProperty({
    description: 'Total charges (late fee + penalty interest + other)',
    example: 85.0,
    readOnly: true,
  })
  @Expose()
  get totalCharges(): number {
    return (this.lateFeeAmount || 0) + 
           (this.penaltyInterestAmount || 0) + 
           (this.otherCharges || 0);
  }

  @ApiProperty({
    description: 'Total amount due including charges',
    example: 2235.0,
    readOnly: true,
  })
  @Expose()
  get totalAmountDueWithCharges(): number {
    return this.totalAmountDue + this.totalCharges;
  }

  @ApiProperty({
    description: 'Payment percentage',
    example: 100.0,
    readOnly: true,
  })
  @Expose()
  get paymentPercentage(): number {
    if (this.totalAmountDue === 0) return 0;
    return (this.amountPaid / this.totalAmountDue) * 100;
  }

  @ApiProperty({
    description: 'Whether payment is fully paid',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isFullyPaid(): boolean {
    return this.status === RepaymentStatus.PAID;
  }

  @ApiProperty({
    description: 'Whether payment is partially paid',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isPartiallyPaid(): boolean {
    return this.status === RepaymentStatus.PARTIALLY_PAID;
  }

  @ApiProperty({
    description: 'Whether payment is overdue',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isOverdue(): boolean {
    return this.status === RepaymentStatus.OVERDUE;
  }

  @ApiProperty({
    description: 'Whether payment is due',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isDue(): boolean {
    return this.status === RepaymentStatus.DUE;
  }

  @ApiProperty({
    description: 'Whether payment is pending',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isPending(): boolean {
    return this.status === RepaymentStatus.PENDING;
  }

  @ApiProperty({
    description: 'Days until due date (negative if overdue)',
    example: 5,
    readOnly: true,
  })
  @Expose()
  get daysUntilDue(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Whether payment is within grace period',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isWithinGracePeriod(): boolean {
    if (!this.isOverdue) return false;
    
    const today = new Date();
    const due = new Date(this.dueDate);
    const gracePeriodEnd = new Date(due);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + this.gracePeriodDays);
    
    return today <= gracePeriodEnd;
  }

  @ApiProperty({
    description: 'Effective payment date (payment date or due date if not paid)',
    example: '2024-02-15',
    readOnly: true,
  })
  @Expose()
  get effectivePaymentDate(): Date {
    return this.paymentDate || this.dueDate;
  }

  @ApiProperty({
    description: 'Principal paid amount',
    example: 2000.0,
    readOnly: true,
  })
  @Expose()
  get principalPaid(): number {
    if (this.amountPaid === 0) return 0;
    
    // Simple proportional allocation
    const principalRatio = this.principalAmount / this.totalAmountDue;
    return this.amountPaid * principalRatio;
  }

  @ApiProperty({
    description: 'Interest paid amount',
    example: 150.0,
    readOnly: true,
  })
  @Expose()
  get interestPaid(): number {
    if (this.amountPaid === 0) return 0;
    
    // Simple proportional allocation
    const interestRatio = this.interestAmount / this.totalAmountDue;
    return this.amountPaid * interestRatio;
  }

  @ApiProperty({
    description: 'Charges paid amount',
    example: 0.0,
    readOnly: true,
  })
  @Expose()
  get chargesPaid(): number {
    if (this.amountPaid === 0) return 0;
    
    // Charges are paid after principal and interest
    const principalInterestPaid = this.principalPaid + this.interestPaid;
    if (this.amountPaid <= principalInterestPaid) {
      return 0;
    }
    
    return Math.min(this.amountPaid - principalInterestPaid, this.totalCharges);
  }

  @ApiProperty({
    description: 'Whether repayment is written off',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isWrittenOff(): boolean {
    return this.status === RepaymentStatus.WRITTEN_OFF;
  }

  @ApiProperty({
    description: 'Whether repayment is in collection',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isInCollection(): boolean {
    return this.status === RepaymentStatus.IN_COLLECTION;
  }

  @ApiProperty({
    description: 'Whether repayment is cancelled',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCancelled(): boolean {
    return this.status === RepaymentStatus.CANCELLED;
  }

  // Lifecycle hooks
  @BeforeInsert()
  async beforeInsert() {
    if (!this.repaymentNumber) {
      this.repaymentNumber = this.generateRepaymentNumber();
    }
    
    // Set remaining balance to total amount due initially
    if (this.remainingBalance === undefined || this.remainingBalance === null) {
      this.remainingBalance = this.totalAmountDue;
    }
    
    // Calculate initial status based on due date
    this.updateStatusBasedOnDueDate();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    // Update version for optimistic locking
    this.version += 1;
    
    // Update status based on current state
    this.updateStatus();
    
    // Calculate days overdue if overdue
    if (this.isOverdue) {
      this.calculateDaysOverdue();
    }
    
    // Calculate charges if overdue
    if (this.isOverdue && !this.isWithinGracePeriod) {
      this.calculateCharges();
    }
  }

  @AfterInsert()
  async afterInsert() {
    console.log(`Loan repayment created: ${this.repaymentNumber} (${this.id})`);
    // Emit event: loan.repayment.created
  }

  @AfterUpdate()
  async afterUpdate() {
    console.log(`Loan repayment updated: ${this.repaymentNumber} (${this.id})`);
    // Emit event: loan.repayment.updated
  }

  // Business logic methods
  private generateRepaymentNumber(): string {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REP-${new Date().getFullYear()}-${timestamp}${random}`;
  }

  private updateStatusBasedOnDueDate(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (today > due && this.status === RepaymentStatus.PENDING) {
      this.status = RepaymentStatus.DUE;
    }
  }

  private updateStatus(): void {
    // Update status based on payment amount
    if (this.amountPaid === 0) {
      if (this.status !== RepaymentStatus.OVERDUE && 
          this.status !== RepaymentStatus.DUE && 
          this.status !== RepaymentStatus.PENDING) {
        this.status = RepaymentStatus.PENDING;
      }
    } else if (this.amountPaid >= this.totalAmountDue) {
      this.status = RepaymentStatus.PAID;
      if (!this.paymentDate) {
        this.paymentDate = new Date();
      }
    } else if (this.amountPaid > 0) {
      this.status = RepaymentStatus.PARTIALLY_PAID;
    }
    
    // Check if overdue
    if (!this.isFullyPaid && !this.isPartiallyPaid) {
      const today = new Date();
      const due = new Date(this.dueDate);
      
      if (today > due) {
        this.status = RepaymentStatus.OVERDUE;
      } else if (this.status === RepaymentStatus.OVERDUE) {
        this.status = RepaymentStatus.DUE;
      }
    }
    
    // Update remaining balance
    this.remainingBalance = Math.max(0, this.totalAmountDue - this.amountPaid);
  }

  private calculateDaysOverdue(): void {
    if (!this.isOverdue) {
      this.daysOverdue = 0;
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - due.getTime();
    this.daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  private calculateCharges(): void {
    if (this.isFullyPaid || this.daysOverdue <= this.gracePeriodDays) {
      return;
    }
    
    // Calculate late fee
    this.calculateLateFee();
    
    // Calculate penalty interest
    this.calculatePenaltyInterest();
  }

  private calculateLateFee(): void {
    if (!this.lateFeeType || this.lateFeeType === LateFeeType.NONE) {
      this.lateFeeAmount = 0;
      return;
    }
    
    const overdueDays = Math.max(0, this.daysOverdue - this.gracePeriodDays);
    
    switch (this.lateFeeType) {
      case LateFeeType.FIXED:
        this.lateFeeAmount = this.lateFeeRate || 0;
        break;
        
      case LateFeeType.PERCENTAGE:
        const percentage = (this.lateFeeRate || 0) / 100;
        this.lateFeeAmount = this.totalAmountDue * percentage;
        break;
        
      case LateFeeType.DAILY:
        const dailyRate = this.lateFeeRate || 0;
        this.lateFeeAmount = dailyRate * overdueDays;
        break;
        
      default:
        this.lateFeeAmount = 0;
    }
  }

  private calculatePenaltyInterest(): void {
    if (!this.penaltyInterestRate || this.penaltyInterestRate === 0) {
      this.penaltyInterestAmount = 0;
      return;
    }
    
    const overdueDays = Math.max(0, this.daysOverdue - this.gracePeriodDays);
    const dailyPenaltyRate = (this.penaltyInterestRate / 100) / 365;
    const overdueBalance = this.remainingBalance || this.totalAmountDue;
    
    this.penaltyInterestAmount = overdueBalance * dailyPenaltyRate * overdueDays;
  }

  makePayment(
    amount: number,
    paymentMethod: PaymentMethod,
    paymentReference: string,
    transactionId?: string,
    notes?: string,
  ): void {
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    
    if (this.isFullyPaid) {
      throw new Error('Repayment is already fully paid');
    }
    
    if (this.isCancelled) {
      throw new Error('Cannot make payment on cancelled repayment');
    }
    
    if (this.isWrittenOff) {
      throw new Error('Cannot make payment on written-off repayment');
    }
    
    // Calculate total amount due including charges
    const totalDue = this.totalAmountDueWithCharges;
    
    // Check if payment exceeds total due
    if (this.amountPaid + amount > totalDue) {
      throw new Error(`Payment amount exceeds total due. Maximum payment: ${totalDue - this.amountPaid}`);
    }
    
    // Update payment details
    this.amountPaid += amount;
    this.paymentMethod = paymentMethod;
    this.paymentReference = paymentReference;
    this.transactionId = transactionId;
    this.paymentDate = new Date();
    
    if (notes) {
      this.notes = notes;
    }
    
    // Update status
    this.updateStatus();
    
    // Calculate charges if not already calculated
    if (this.isOverdue && !this.isWithinGracePeriod) {
      this.calculateCharges();
    }
  }

  markAsPaid(
    paymentMethod: PaymentMethod,
    paymentReference: string,
    transactionId?: string,
    notes?: string,
  ): void {
    this.makePayment(
      this.totalAmountDueWithCharges - this.amountPaid,
      paymentMethod,
      paymentReference,
      transactionId,
      notes,
    );
  }

  markAsWrittenOff(reason: string, writeOffAmount?: number): void {
    if (this.isFullyPaid) {
      throw new Error('Cannot write off a fully paid repayment');
    }
    
    if (this.isCancelled) {
      throw new Error('Cannot write off a cancelled repayment');
    }
    
    this.writeOffReason = reason;
    this.writeOffAmount = writeOffAmount || this.remainingBalance;
    this.status = RepaymentStatus.WRITTEN_OFF;
    this.writeOffDate = new Date();
    
    // Set remaining balance to zero
    this.remainingBalance = 0;
  }

  markAsCancelled(): void {
    if (this.isFullyPaid) {
      throw new Error('Cannot cancel a fully paid repayment');
    }
    
    if (this.isWrittenOff) {
      throw new Error('Cannot cancel a written-off repayment');
    }
    
    this.status = RepaymentStatus.CANCELLED;
  }

  sendToCollection(collectionAgencyId: string): void {
    if (this.isFullyPaid) {
      throw new Error('Cannot send paid repayment to collection');
    }
    
    if (this.isWrittenOff) {
      throw new Error('Cannot send written-off repayment to collection');
    }
    
    if (this.isCancelled) {
      throw new Error('Cannot send cancelled repayment to collection');
    }
    
    this.collectionAgencyId = collectionAgencyId;
    this.status = RepaymentStatus.IN_COLLECTION;
    this.collectionStatus = 'assigned';
  }

  addCollectionAction(action: string): void {
    if (!this.collectionActions) {
      this.collectionActions = [];
    }
    
    this.collectionActions.push(action);
    this.collectionStatus = 'in_progress';
  }

  markDisputeResolved(resolution: string): void {
    this.isDisputed = false;
    this.disputeStatus = 'resolved';
    this.disputeResolvedDate = new Date();
    this.notes = (this.notes || '') + `\nDispute resolved: ${resolution}`;
  }

  getPaymentSummary(): {
    totalDue: number;
    amountPaid: number;
    remaining: number;
    status: string;
    dueDate: Date;
  } {
    return {
      totalDue: this.totalAmountDueWithCharges,
      amountPaid: this.amountPaid,
      remaining: this.remainingBalance,
      status: this.status,
      dueDate: this.dueDate,
    };
  }

  isPaymentLate(): boolean {
    return this.daysOverdue > 0;
  }

  getNextAction(): string {
    if (this.isFullyPaid) {
      return 'payment_complete';
    }
    
    if (this.isOverdue) {
      if (this.isWithinGracePeriod) {
        return 'send_grace_period_reminder';
      } else {
        return 'send_overdue_notice';
      }
    }
    
    if (this.isDue) {
      return 'send_due_reminder';
    }
    
    if (this.isPending) {
      const daysUntil = this.daysUntilDue;
      if (daysUntil <= 7) {
        return 'send_upcoming_payment_notice';
      }
    }
    
    return 'monitor';
  }

  // Utility methods
  toJSON(): any {
    const obj = { ...this };
    // Remove sensitive/internal fields
    delete obj.internalNotes;
    delete obj.collectionAgencyId;
    delete obj.deletedAt;
    delete obj.version;
    delete obj.metadata;
    delete obj.paymentResponse;
    return obj;
  }

  toString(): string {
    return `LoanRepayment#${this.repaymentNumber} (${this.status})`;
  }
}