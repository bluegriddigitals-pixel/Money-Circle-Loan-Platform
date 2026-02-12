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
import { Exclude, Expose } from 'class-transformer';
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
  Min,
  IsObject,
  IsEmail,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { User } from '../../user/entities/user.entity';
import { EscrowAccount } from './escrow-account.entity';

export enum PayoutRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum PayoutRequestType {
  STANDARD = 'standard',
  INSTANT = 'instant',
  SCHEDULED = 'scheduled',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  CHECK = 'check',
  CRYPTO = 'crypto',
}

@Entity('payout_requests')
@Index(['requestNumber'], { unique: true })
@Index(['userId'])
@Index(['escrowAccountId'])
@Index(['status'])
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
    example: 'PO-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  requestNumber: string;

  @ApiProperty({
    description: 'User ID requesting the payout',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  userId: string;

  @ApiPropertyOptional({
    description: 'Escrow account ID for the payout',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId: string;

  @ApiProperty({
    description: 'Payout request type',
    enum: PayoutRequestType,
    example: PayoutRequestType.STANDARD,
    default: PayoutRequestType.STANDARD,
  })
  @Column({
    type: 'enum',
    enum: PayoutRequestType,
    default: PayoutRequestType.STANDARD,
    nullable: false,
  })
  @IsEnum(PayoutRequestType)
  type: PayoutRequestType;

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
    description: 'Request amount',
    example: 5000.00,
    minimum: 0.01,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsString()
  currency: string;

  @ApiPropertyOptional({
    description: 'Processing fee',
    example: 25.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee: number;

  @ApiPropertyOptional({
    description: 'Net amount (amount - fee)',
    example: 4975.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netAmount: number;

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

  @ApiPropertyOptional({
    description: 'Recipient name',
    example: 'John Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  recipientName: string;

  @ApiPropertyOptional({
    description: 'Recipient email',
    example: 'john.doe@example.com',
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
  @IsString()
  recipientPhone: string;

  @ApiPropertyOptional({
    description: 'Payment details (bank account, crypto address, etc.)',
    example: {
      bankName: 'First National Bank',
      accountNumber: '1234567890',
      routingNumber: '021000021',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  paymentDetails: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Description/purpose',
    example: 'Loan repayment withdrawal',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'External transaction reference',
    example: 'payout_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  transactionReference: string;

  @ApiPropertyOptional({
    description: 'Approved by user ID',
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
  approvedAt: Date;

  @ApiPropertyOptional({
    description: 'Approval notes',
    example: 'Approved after verification',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  approvalNotes: string;

  @ApiPropertyOptional({
    description: 'Rejection reason',
    example: 'Insufficient funds',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Processing start date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  processingStartedAt: Date;

  @ApiPropertyOptional({
    description: 'Processing end date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  processingCompletedAt: Date;

  @ApiPropertyOptional({
    description: 'Scheduled payout date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  scheduledDate: Date;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'User cancelled request',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Cancelled by user ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  cancelledBy: string;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Bank account invalid',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  failureReason: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

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

  // Relations
  @ManyToOne(() => User, (user) => user.payoutRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => EscrowAccount, (escrow) => escrow.payoutRequests, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'escrowAccountId' })
  escrowAccount: EscrowAccount;

  // Lifecycle hooks
  @BeforeInsert()
  generateRequestNumber() {
    if (!this.requestNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.requestNumber = `PO-${year}-${random}`;
    }
    if (!this.netAmount && this.amount && this.fee !== undefined) {
      this.netAmount = this.amount - this.fee;
    }
  }

  @BeforeUpdate()
  updateNetAmount() {
    if (this.amount !== undefined && this.fee !== undefined) {
      this.netAmount = this.amount - this.fee;
    }
  }

  // Virtual properties
  @ApiProperty({
    description: 'Can the payout request be processed',
    example: true,
    readOnly: true,
  })
  @Expose()
  get canBeProcessed(): boolean {
    return this.status === PayoutRequestStatus.APPROVED && !this.processingCompletedAt;
  }

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
    description: 'Is payout request completed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCompleted(): boolean {
    return this.status === PayoutRequestStatus.COMPLETED;
  }

  // Methods
  approve(approvedBy: string, notes?: string): void {
    this.status = PayoutRequestStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    if (notes) {
      this.approvalNotes = notes;
    }
  }

  reject(rejectedBy: string, reason: string): void {
    this.status = PayoutRequestStatus.REJECTED;
    this.approvedBy = rejectedBy;
    this.rejectionReason = reason;
  }

  startProcessing(): void {
    this.status = PayoutRequestStatus.PROCESSING;
    this.processingStartedAt = new Date();
  }

  complete(transactionReference?: string): void {
    this.status = PayoutRequestStatus.COMPLETED;
    this.processingCompletedAt = new Date();
    if (transactionReference) {
      this.transactionReference = transactionReference;
    }
  }

  fail(reason: string): void {
    this.status = PayoutRequestStatus.FAILED;
    this.failureReason = reason;
  }

  cancel(cancelledBy: string, reason: string): void {
    this.status = PayoutRequestStatus.CANCELLED;
    this.cancelledBy = cancelledBy;
    this.cancellationReason = reason;
  }

  // JSON serialization
  toJSON(): Partial<PayoutRequest> {
    return {
      id: this.id,
      requestNumber: this.requestNumber,
      type: this.type,
      payoutMethod: this.payoutMethod,
      amount: this.amount,
      currency: this.currency,
      netAmount: this.netAmount,
      fee: this.fee,
      status: this.status,
      recipientName: this.recipientName,
      recipientEmail: this.recipientEmail,
      description: this.description,
      transactionReference: this.transactionReference,
      scheduledDate: this.scheduledDate,
      canBeProcessed: this.canBeProcessed,
      isPending: this.isPending,
      isApproved: this.isApproved,
      isCompleted: this.isCompleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}