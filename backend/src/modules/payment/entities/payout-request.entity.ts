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
import { User } from '../../user/entities/user.entity';
import { EscrowAccount } from './escrow-account.entity';

export enum PayoutRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum PayoutRequestType {
  LOAN_DISBURSEMENT = 'loan_disbursement',
  REFUND = 'refund',
  COMMISSION = 'commission',
  DIVIDEND = 'dividend',
  WITHDRAWAL = 'withdrawal',
  SETTLEMENT = 'settlement',
  OTHER = 'other',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash',
  CRYPTO = 'crypto',
  WIRE_TRANSFER = 'wire_transfer',
}

@Entity('payout_requests')
@Index(['requestNumber'], { unique: true })
@Index(['userId'])
@Index(['escrowAccountId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class PayoutRequest {
  @ApiProperty({
    description: 'Unique identifier for the payout request',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique payout request number',
    example: 'PAYOUT-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  requestNumber: string;

  @ApiProperty({
    description: 'ID of the user requesting the payout',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  userId: string;

  @ApiPropertyOptional({
    description: 'ID of the escrow account (if applicable)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId: string;

  @ApiProperty({
    description: 'Payout request type',
    enum: PayoutRequestType,
    example: PayoutRequestType.LOAN_DISBURSEMENT,
  })
  @Column({
    type: 'enum',
    enum: PayoutRequestType,
    nullable: false,
  })
  @IsEnum(PayoutRequestType)
  type: PayoutRequestType;

  @ApiProperty({
    description: 'Payout amount',
    example: 5000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Fees deducted from payout',
    example: 50.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  fees: number;

  @ApiPropertyOptional({
    description: 'Taxes deducted from payout',
    example: 250.0,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  taxes: number;

  @ApiProperty({
    description: 'Net amount after fees and taxes',
    example: 4700.0,
    readOnly: true,
    minimum: 0,
  })
  @Expose()
  get netAmount(): number {
    return Math.max(0, this.amount - this.fees - this.taxes);
  }

  @ApiProperty({
    description: 'Payout method',
    enum: PayoutMethod,
    example: PayoutMethod.BANK_TRANSFER,
  })
  @Column({
    type: 'enum',
    enum: PayoutMethod,
    nullable: false,
  })
  @IsEnum(PayoutMethod)
  payoutMethod: PayoutMethod;

  @ApiProperty({
    description: 'Payout request status',
    enum: PayoutRequestStatus,
    example: PayoutRequestStatus.PENDING,
    default: PayoutRequestStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PayoutRequestStatus,
    default: PayoutRequestStatus.PENDING,
    nullable: false,
  })
  @IsEnum(PayoutRequestStatus)
  status: PayoutRequestStatus;

  @ApiProperty({
    description: 'Recipient name',
    example: 'Jane Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipientName: string;

  @ApiPropertyOptional({
    description: 'Recipient email',
    example: 'jane.doe@example.com',
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
      accountHolder: 'Jane Doe',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  paymentDetails: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Payout purpose/description',
    example: 'Loan disbursement for home renovation',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Internal reference/notes',
    example: 'Loan ID: L2024-001',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalReference: string;

  @ApiPropertyOptional({
    description: 'Approver user ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
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
    description: 'Rejection reason',
    example: 'Insufficient funds in escrow account',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Rejected by user ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  rejectedBy: string;

  @ApiPropertyOptional({
    description: 'Rejection date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedAt: Date;

  @ApiPropertyOptional({
    description: 'Processing start date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processingStartedAt: Date;

  @ApiPropertyOptional({
    description: 'Processing end/completion date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processingCompletedAt: Date;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Bank account verification failed',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  failureReason: string;

  @ApiPropertyOptional({
    description: 'Transaction reference from payment processor',
    example: 'txn_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  transactionReference: string;

  @ApiPropertyOptional({
    description: 'Estimated processing time in hours',
    example: 24,
    minimum: 0,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedProcessingHours: number;

  @ApiPropertyOptional({
    description: 'Actual processing time in hours',
    example: 18.5,
    readOnly: true,
  })
  @Expose()
  get actualProcessingHours(): number | null {
    if (!this.processingStartedAt || !this.processingCompletedAt) return null;
    const start = new Date(this.processingStartedAt).getTime();
    const end = new Date(this.processingCompletedAt).getTime();
    return (end - start) / (1000 * 60 * 60);
  }

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'User requested cancellation',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Cancelled by user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
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
    description: 'Supporting documents',
    example: [
      { type: 'invoice', url: 'https://example.com/invoice.pdf' },
      { type: 'agreement', url: 'https://example.com/agreement.pdf' },
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
    example: ['urgent', 'large_amount', 'international'],
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
    example: 'User requested expedited processing',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Requires additional verification due to large amount',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiProperty({
    description: 'Payout request creation timestamp',
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
    description: 'User who requested the payout',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.payoutRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional({
    description: 'Escrow account associated with this payout',
    type: () => EscrowAccount,
  })
  @ManyToOne(() => EscrowAccount, (escrowAccount) => escrowAccount.transactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'escrow_account_id' })
  escrowAccount: EscrowAccount;

  // Virtual/computed properties
  @ApiProperty({
    description: 'Is payout request pending',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isPending(): boolean {
    return this.status === PayoutRequestStatus.PENDING;
  }

  @ApiProperty({
    description: 'Is payout request approved',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isApproved(): boolean {
    return this.status === PayoutRequestStatus.APPROVED;
  }

  @ApiProperty({
    description: 'Is payout request rejected',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isRejected(): boolean {
    return this.status === PayoutRequestStatus.REJECTED;
  }

  @ApiProperty({
    description: 'Is payout request completed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCompleted(): boolean {
    return this.status === PayoutRequestStatus.COMPLETED;
  }

  @ApiProperty({
    description: 'Is payout request failed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFailed(): boolean {
    return this.status === PayoutRequestStatus.FAILED;
  }

  @ApiProperty({
    description: 'Is payout request on hold',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isOnHold(): boolean {
    return this.status === PayoutRequestStatus.ON_HOLD;
  }

  @ApiProperty({
    description: 'Is payout request cancellable',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isCancellable(): boolean {
    return [
      PayoutRequestStatus.PENDING,
      PayoutRequestStatus.APPROVED,
      PayoutRequestStatus.ON_HOLD,
    ].includes(this.status);
  }

  @ApiProperty({
    description: 'Estimated completion date',
    example: '2024-01-20T10:30:00.000Z',
    readOnly: true,
  })
  @Expose()
  get estimatedCompletionDate(): Date | null {
    if (!this.estimatedProcessingHours) return null;
    const startDate = this.approvedAt || this.createdAt;
    if (!startDate) return null;
    
    const completionDate = new Date(startDate);
    completionDate.setHours(completionDate.getHours() + this.estimatedProcessingHours);
    return completionDate;
  }

  @ApiProperty({
    description: 'Days since creation',
    example: 2,
    readOnly: true,
  })
  @Expose()
  get daysSinceCreation(): number {
    const today = new Date();
    const created = new Date(this.createdAt);
    const diffTime = today.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Lifecycle hooks
  @BeforeInsert()
  generateRequestNumber() {
    if (!this.requestNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.requestNumber = `PAYOUT-${year}-${random}`;
    }
  }

  @BeforeUpdate()
  updateCalculatedFields() {
    // Update version for optimistic locking
    this.version += 1;

    // Set timestamps based on status changes
    if (this.status === PayoutRequestStatus.APPROVED && !this.approvedAt) {
      this.approvedAt = new Date();
    } else if (this.status === PayoutRequestStatus.REJECTED && !this.rejectedAt) {
      this.rejectedAt = new Date();
    } else if (this.status === PayoutRequestStatus.PROCESSING && !this.processingStartedAt) {
      this.processingStartedAt = new Date();
    } else if (this.status === PayoutRequestStatus.COMPLETED && !this.processingCompletedAt) {
      this.processingCompletedAt = new Date();
    } else if (this.status === PayoutRequestStatus.CANCELLED && !this.cancelledAt) {
      this.cancelledAt = new Date();
    } else if (this.status === PayoutRequestStatus.ON_HOLD && !this.placedOnHoldAt) {
      this.placedOnHoldAt = new Date();
    }
  }

  // Business logic methods
  approve(approvedBy: string, notes?: string): void {
    if (this.status !== PayoutRequestStatus.PENDING) {
      throw new Error(`Cannot approve payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.approvalNotes = notes;
  }

  reject(rejectedBy: string, reason: string): void {
    if (this.status !== PayoutRequestStatus.PENDING) {
      throw new Error(`Cannot reject payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.REJECTED;
    this.rejectedBy = rejectedBy;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
  }

  startProcessing(): void {
    if (this.status !== PayoutRequestStatus.APPROVED) {
      throw new Error(`Cannot start processing payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.PROCESSING;
    this.processingStartedAt = new Date();
  }

  complete(transactionReference?: string): void {
    if (this.status !== PayoutRequestStatus.PROCESSING) {
      throw new Error(`Cannot complete payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.COMPLETED;
    this.processingCompletedAt = new Date();
    if (transactionReference) {
      this.transactionReference = transactionReference;
    }
  }

  fail(failureReason: string): void {
    this.status = PayoutRequestStatus.FAILED;
    this.failureReason = failureReason;
    this.processingCompletedAt = new Date();
  }

  cancel(cancelledBy: string, reason: string): void {
    if (!this.isCancellable) {
      throw new Error(`Cannot cancel payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.CANCELLED;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }

  placeOnHold(reason: string, releaseDate?: Date): void {
    if (this.status === PayoutRequestStatus.COMPLETED || 
        this.status === PayoutRequestStatus.FAILED || 
        this.status === PayoutRequestStatus.CANCELLED) {
      throw new Error(`Cannot place on hold payout request with status: ${this.status}`);
    }

    this.status = PayoutRequestStatus.ON_HOLD;
    this.placedOnHoldAt = new Date();
    this.holdReason = reason;
    this.holdReleaseDate = releaseDate;
  }

  releaseFromHold(): void {
    if (this.status !== PayoutRequestStatus.ON_HOLD) {
      throw new Error(`Cannot release from hold payout request with status: ${this.status}`);
    }

    // Return to previous status or default to PENDING
    this.status = PayoutRequestStatus.PENDING;
    this.holdReleaseDate = new Date();
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
      this.requestNumber &&
      this.userId &&
      this.type &&
      this.amount > 0 &&
      this.payoutMethod &&
      this.recipientName
    );
  }

  @Expose()
  get canBeProcessed(): boolean {
    return this.isApproved && !this.isOnHold;
  }

  @Expose()
  get processingTimeExceeded(): boolean {
    if (!this.estimatedProcessingHours || !this.processingStartedAt) return false;
    
    const now = new Date();
    const start = new Date(this.processingStartedAt);
    const hoursElapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return hoursElapsed > this.estimatedProcessingHours * 1.5; // 50% buffer
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
      requestNumber: this.requestNumber,
      type: this.type,
      amount: this.amount,
      netAmount: this.netAmount,
      fees: this.fees,
      taxes: this.taxes,
      payoutMethod: this.payoutMethod,
      status: this.status,
      recipientName: this.recipientName,
      description: this.description,
      isPending: this.isPending,
      isApproved: this.isApproved,
      isCompleted: this.isCompleted,
      isFailed: this.isFailed,
      isOnHold: this.isOnHold,
      isCancellable: this.isCancellable,
      estimatedCompletionDate: this.estimatedCompletionDate,
      daysSinceCreation: this.daysSinceCreation,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}