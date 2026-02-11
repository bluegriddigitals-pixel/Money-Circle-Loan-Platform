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
} from 'typeorm';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
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
  IsUUID,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsPositive,
  Min,
  Max,
  IsInt,
  IsObject,
  IsArray,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { User } from '../../user/entities/user.entity';

export enum DisbursementStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  PARTIAL = 'partial',
}

export enum DisbursementMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  WIRE_TRANSFER = 'wire_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  DIRECT_DEPOSIT = 'direct_deposit',
}

export enum DisbursementType {
  LOAN_DISBURSEMENT = 'loan_disbursement',
  REFUND = 'refund',
  COMMISSION = 'commission',
  BONUS = 'bonus',
  REIMBURSEMENT = 'reimbursement',
  GRANT = 'grant',
  SETTLEMENT = 'settlement',
  OTHER = 'other',
}

@Entity('disbursements')
@Index(['disbursementNumber'], { unique: true })
@Index(['loanId'])
@Index(['escrowAccountId'])
@Index(['status'])
@Index(['type'])
@Index(['scheduledDate'])
@Index(['createdAt'])
export class Disbursement {
  @ApiProperty({
    description: 'Unique identifier for the disbursement',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique disbursement number',
    example: 'DISB-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  disbursementNumber: string;

  @ApiProperty({
    description: 'ID of the associated loan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  loanId: string;

  @ApiPropertyOptional({
    description: 'ID of the escrow account used for disbursement',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId: string;

  @ApiProperty({
    description: 'Disbursement type',
    enum: DisbursementType,
    example: DisbursementType.LOAN_DISBURSEMENT,
  })
  @Column({
    type: 'enum',
    enum: DisbursementType,
    nullable: false,
  })
  @IsEnum(DisbursementType)
  type: DisbursementType;

  @ApiProperty({
    description: 'Total disbursement amount',
    example: 50000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Amount already disbursed (for partial disbursements)',
    example: 25000.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  disbursedAmount: number;

  @ApiProperty({
    description: 'Pending amount to be disbursed',
    example: 25000.0,
    readOnly: true,
    minimum: 0,
  })
  @Expose()
  get pendingAmount(): number {
    return Math.max(0, this.amount - this.disbursedAmount);
  }

  @ApiProperty({
    description: 'Disbursement status',
    enum: DisbursementStatus,
    example: DisbursementStatus.PENDING,
    default: DisbursementStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: DisbursementStatus,
    default: DisbursementStatus.PENDING,
    nullable: false,
  })
  @IsEnum(DisbursementStatus)
  status: DisbursementStatus;

  @ApiProperty({
    description: 'Disbursement method',
    enum: DisbursementMethod,
    example: DisbursementMethod.BANK_TRANSFER,
  })
  @Column({
    type: 'enum',
    enum: DisbursementMethod,
    nullable: false,
  })
  @IsEnum(DisbursementMethod)
  method: DisbursementMethod;

  @ApiPropertyOptional({
    description: 'Scheduled disbursement date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledDate: Date;

  @ApiPropertyOptional({
    description: 'Actual disbursement date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  disbursedAt: Date;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Borrower',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipientName: string;

  @ApiPropertyOptional({
    description: 'Recipient email',
    example: 'john.borrower@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  recipientEmail: string;

  @ApiPropertyOptional({
    description: 'Recipient phone',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  recipientPhone: string;

  @ApiPropertyOptional({
    description: 'Payment details (bank account, wallet, etc.)',
    example: {
      bankName: 'First National Bank',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      accountHolder: 'John Borrower',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  paymentDetails: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Disbursement instructions',
    example: 'Disburse in two equal installments',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  instructions: string;

  @ApiPropertyOptional({
    description: 'Disbursement terms and conditions',
    example: 'Funds to be used solely for home renovation',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  terms: string;

  @ApiPropertyOptional({
    description: 'Processing fees',
    example: 250.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  processingFees: number;

  @ApiPropertyOptional({
    description: 'Taxes withheld',
    example: 1250.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  taxesWithheld: number;

  @ApiPropertyOptional({
    description: 'Other deductions',
    example: 500.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  otherDeductions: number;

  @ApiProperty({
    description: 'Net amount after all deductions',
    example: 48000.0,
    readOnly: true,
    minimum: 0,
  })
  @Expose()
  get netAmount(): number {
    const deductions = this.processingFees + this.taxesWithheld + this.otherDeductions;
    return Math.max(0, this.amount - deductions);
  }

  @ApiPropertyOptional({
    description: 'Transaction reference from payment processor',
    example: 'txn_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  transactionReference: string;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Bank account verification failed',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  failureReason: string;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Loan application cancelled',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Cancelled by user ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  cancelledBy: string;

  @ApiPropertyOptional({
    description: 'Cancellation date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelledAt: Date;

  @ApiPropertyOptional({
    description: 'Hold reason',
    example: 'Pending documentation',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  holdReason: string;

  @ApiPropertyOptional({
    description: 'Placed on hold date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  placedOnHoldAt: Date;

  @ApiPropertyOptional({
    description: 'Expected release date from hold',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  holdReleaseDate: Date;

  @ApiPropertyOptional({
    description: 'Approver user ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Approval date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvedAt: Date;

  @ApiPropertyOptional({
    description: 'Approval notes',
    example: 'Approved as per loan agreement',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  approvalNotes: string;

  @ApiPropertyOptional({
    description: 'Disbursement schedule (for multiple installments)',
    example: [
      { amount: 25000, dueDate: '2024-02-01', status: 'pending' },
      { amount: 25000, dueDate: '2024-03-01', status: 'pending' },
    ],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  schedule: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: Date;
    status: string;
    disbursedAt?: Date;
    transactionReference?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    example: [
      { type: 'loan_agreement', url: 'https://example.com/agreement.pdf' },
      { type: 'id_verification', url: 'https://example.com/id.pdf' },
    ],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  supportingDocuments: Array<{
    type: string;
    url: string;
    name: string;
    uploadedAt: Date;
  }>;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['urgent', 'large_amount', 'first_disbursement'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Notes/comments',
    example: 'Disbursement for home renovation project',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Requires manager approval due to large amount',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiProperty({
    description: 'Disbursement creation timestamp',
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

  // Relations
  @ApiPropertyOptional({
    description: 'Loan associated with this disbursement',
    type: () => Loan,
  })
  @ManyToOne(() => Loan, (loan) => loan.disbursements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Escrow account used for this disbursement',
    type: () => EscrowAccount,
  })
  @ManyToOne(() => EscrowAccount, (escrowAccount) => escrowAccount.transactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'escrow_account_id' })
  escrowAccount: EscrowAccount;

  @ApiPropertyOptional({
    description: 'User who approved the disbursement',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'id' })
  approver: User;

  @ApiPropertyOptional({
    description: 'User who cancelled the disbursement',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by', referencedColumnName: 'id' })
  canceller: User;

  // Virtual/computed properties
  @ApiProperty({
    description: 'Is disbursement pending',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isPending(): boolean {
    return this.status === DisbursementStatus.PENDING;
  }

  @ApiProperty({
    description: 'Is disbursement scheduled',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isScheduled(): boolean {
    return this.status === DisbursementStatus.SCHEDULED;
  }

  @ApiProperty({
    description: 'Is disbursement completed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCompleted(): boolean {
    return this.status === DisbursementStatus.COMPLETED;
  }

  @ApiProperty({
    description: 'Is disbursement partial',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isPartial(): boolean {
    return this.status === DisbursementStatus.PARTIAL;
  }

  @ApiProperty({
    description: 'Is disbursement failed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFailed(): boolean {
    return this.status === DisbursementStatus.FAILED;
  }

  @ApiProperty({
    description: 'Is disbursement on hold',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isOnHold(): boolean {
    return this.status === DisbursementStatus.ON_HOLD;
  }

  @ApiProperty({
    description: 'Is disbursement cancellable',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isCancellable(): boolean {
    return [
      DisbursementStatus.PENDING,
      DisbursementStatus.SCHEDULED,
      DisbursementStatus.ON_HOLD,
    ].includes(this.status);
  }

  @ApiProperty({
    description: 'Percentage disbursed',
    example: 50.0,
    readOnly: true,
  })
  @Expose()
  get percentageDisbursed(): number {
    if (this.amount <= 0) return 0;
    return (this.disbursedAmount / this.amount) * 100;
  }

  @ApiProperty({
    description: 'Is disbursement overdue',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isOverdue(): boolean {
    if (!this.scheduledDate) return false;
    return new Date() > this.scheduledDate && this.status === DisbursementStatus.SCHEDULED;
  }

  @ApiProperty({
    description: 'Days until scheduled disbursement',
    example: 5,
    readOnly: true,
  })
  @Expose()
  get daysUntilScheduled(): number | null {
    if (!this.scheduledDate) return null;
    const today = new Date();
    const scheduled = new Date(this.scheduledDate);
    const diffTime = scheduled.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Is disbursement fully disbursed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFullyDisbursed(): boolean {
    return this.disbursedAmount >= this.amount;
  }

  // Lifecycle hooks
  @BeforeInsert()
  generateDisbursementNumber() {
    if (!this.disbursementNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.disbursementNumber = `DISB-${year}-${random}`;
    }
  }

  @BeforeUpdate()
  updateCalculatedFields() {
    // Update version for optimistic locking
    this.version += 1;

    // Update status based on disbursed amount
    if (this.disbursedAmount > 0 && this.disbursedAmount < this.amount) {
      this.status = DisbursementStatus.PARTIAL;
    } else if (this.disbursedAmount >= this.amount) {
      this.status = DisbursementStatus.COMPLETED;
      if (!this.disbursedAt) {
        this.disbursedAt = new Date();
      }
    }

    // Set timestamps based on status changes
    if (this.status === DisbursementStatus.SCHEDULED && !this.scheduledDate) {
      this.scheduledDate = new Date();
    } else if (this.status === DisbursementStatus.APPROVED && !this.approvedAt) {
      this.approvedAt = new Date();
    } else if (this.status === DisbursementStatus.CANCELLED && !this.cancelledAt) {
      this.cancelledAt = new Date();
    } else if (this.status === DisbursementStatus.ON_HOLD && !this.placedOnHoldAt) {
      this.placedOnHoldAt = new Date();
    }
  }

  // Business logic methods
  scheduleDisbursement(date: Date): void {
    if (this.status !== DisbursementStatus.PENDING) {
      throw new Error(`Cannot schedule disbursement with status: ${this.status}`);
    }

    this.status = DisbursementStatus.SCHEDULED;
    this.scheduledDate = date;
  }

  approve(approvedBy: string, notes?: string): void {
    if (this.status !== DisbursementStatus.PENDING && this.status !== DisbursementStatus.SCHEDULED) {
      throw new Error(`Cannot approve disbursement with status: ${this.status}`);
    }

    this.status = DisbursementStatus.PROCESSING;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.approvalNotes = notes;
  }

  disburse(amount: number, transactionReference?: string): void {
    if (this.status !== DisbursementStatus.PROCESSING && this.status !== DisbursementStatus.PARTIAL) {
      throw new Error(`Cannot disburse with status: ${this.status}`);
    }

    if (amount <= 0) {
      throw new Error('Disbursement amount must be positive');
    }

    if (this.disbursedAmount + amount > this.amount) {
      throw new Error('Disbursement amount exceeds total amount');
    }

    this.disbursedAmount += amount;
    this.disbursedAt = new Date();

    if (transactionReference) {
      this.transactionReference = transactionReference;
    }

    // Update schedule if exists
    if (this.schedule && this.schedule.length > 0) {
      const pendingInstallment = this.schedule.find(inst => inst.status === 'pending');
      if (pendingInstallment) {
        pendingInstallment.status = 'disbursed';
        pendingInstallment.disbursedAt = new Date();
        pendingInstallment.transactionReference = transactionReference;
      }
    }
  }

  fail(failureReason: string): void {
    this.status = DisbursementStatus.FAILED;
    this.failureReason = failureReason;
  }

  cancel(cancelledBy: string, reason: string): void {
    if (!this.isCancellable) {
      throw new Error(`Cannot cancel disbursement with status: ${this.status}`);
    }

    this.status = DisbursementStatus.CANCELLED;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }

  placeOnHold(reason: string, releaseDate?: Date): void {
    if (this.status === DisbursementStatus.COMPLETED || 
        this.status === DisbursementStatus.FAILED || 
        this.status === DisbursementStatus.CANCELLED) {
      throw new Error(`Cannot place on hold disbursement with status: ${this.status}`);
    }

    this.status = DisbursementStatus.ON_HOLD;
    this.placedOnHoldAt = new Date();
    this.holdReason = reason;
    this.holdReleaseDate = releaseDate;
  }

  releaseFromHold(): void {
    if (this.status !== DisbursementStatus.ON_HOLD) {
      throw new Error(`Cannot release from hold disbursement with status: ${this.status}`);
    }

    // Return to previous status or default to PENDING
    this.status = this.disbursedAmount > 0 ? DisbursementStatus.PARTIAL : DisbursementStatus.PENDING;
    this.holdReleaseDate = new Date();
  }

  createSchedule(installments: Array<{ amount: number; dueDate: Date }>): void {
    if (this.status !== DisbursementStatus.PENDING) {
      throw new Error(`Cannot create schedule for disbursement with status: ${this.status}`);
    }

    const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
    if (Math.abs(totalAmount - this.amount) > 0.01) {
      throw new Error('Schedule amounts must equal total disbursement amount');
    }

    this.schedule = installments.map((inst, index) => ({
      installmentNumber: index + 1,
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: 'pending',
    }));
  }

  addSupportingDocument(document: {
    type: string;
    url: string;
    name: string;
  }): void {
    if (!this.supportingDocuments) {
      this.supportingDocuments = [];
    }

    this.supportingDocuments.push({
      ...document,
      uploadedAt: new Date(),
    });
  }

  // Validation methods
  @Expose()
  get isValid(): boolean {
    return (
      this.disbursementNumber &&
      this.loanId &&
      this.type &&
      this.amount > 0 &&
      this.method &&
      this.recipientName
    );
  }

  @Expose()
  get canBeProcessed(): boolean {
    return (
      (this.status === DisbursementStatus.PROCESSING || 
       this.status === DisbursementStatus.PARTIAL) &&
      !this.isOnHold
    );
  }

  @Expose()
  get nextInstallment(): any {
    if (!this.schedule || this.schedule.length === 0) return null;
    return this.schedule.find(inst => inst.status === 'pending');
  }

  // Helper methods
  addTag(tag: string): void {
    if (!this.tags) this.tags = [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      const index = this.tags.indexOf(tag);
      if (index > -1) {
        this.tags.splice(index, 1);
      }
    }
  }

  updatePaymentDetails(details: Record<string, any>): void {
    this.paymentDetails = { ...this.paymentDetails, ...details };
  }

  // JSON serialization
  toJSON(): any {
    return {
      id: this.id,
      disbursementNumber: this.disbursementNumber,
      type: this.type,
      amount: this.amount,
      disbursedAmount: this.disbursedAmount,
      pendingAmount: this.pendingAmount,
      netAmount: this.netAmount,
      status: this.status,
      method: this.method,
      recipientName: this.recipientName,
      isPending: this.isPending,
      isScheduled: this.isScheduled,
      isCompleted: this.isCompleted,
      isPartial: this.isPartial,
      isFailed: this.isFailed,
      isOnHold: this.isOnHold,
      isCancellable: this.isCancellable,
      percentageDisbursed: this.percentageDisbursed,
      scheduledDate: this.scheduledDate,
      daysUntilScheduled: this.daysUntilScheduled,
      isOverdue: this.isOverdue,
      nextInstallment: this.nextInstallment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}