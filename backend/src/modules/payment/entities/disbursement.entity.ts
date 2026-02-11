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
  IsArray,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { User } from '../../user/entities/user.entity';

export enum DisbursementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('disbursements')
@Index(['disbursementNumber'], { unique: true })
@Index(['loanId'])
@Index(['escrowAccountId'])
@Index(['status'])
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
    description: 'Loan ID for the disbursement',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  loanId: string;

  @ApiPropertyOptional({
    description: 'Escrow account ID for the disbursement',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId: string;

  @ApiProperty({
    description: 'Disbursement amount',
    example: 50000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Amount already disbursed',
    example: 25000.00,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  disbursedAmount: number;

  @ApiPropertyOptional({
    description: 'Pending amount to be disbursed',
    example: 25000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pendingAmount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsString()
  currency: string;

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

  @ApiPropertyOptional({
    description: 'Scheduled disbursement date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  scheduledDate: Date;

  @ApiPropertyOptional({
    description: 'Actual disbursement date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  disbursedAt: Date;

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
    example: 'Disbursement approved by loan officer',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  approvalNotes: string;

  @ApiPropertyOptional({
    description: 'Cancelled by user ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
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
  cancelledAt: Date;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Loan application withdrawn',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Insufficient escrow balance',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  failureReason: string;

  @ApiPropertyOptional({
    description: 'External transaction reference',
    example: 'txn_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  transactionReference: string;

  @ApiPropertyOptional({
    description: 'Installment schedule for multiple disbursements',
    example: [
      { amount: 25000, dueDate: '2024-01-15' },
      { amount: 25000, dueDate: '2024-02-15' },
    ],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  schedule: Array<{ amount: number; dueDate: Date; status?: string }>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'loan_origination', priority: 'high' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

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

  // Relations
  @ManyToOne(() => Loan, (loan) => loan.disbursements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @ManyToOne(() => EscrowAccount, (escrow) => escrow.disbursements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'escrowAccountId' })
  escrowAccount: EscrowAccount;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelledBy' })
  canceller: User;

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
    if (!this.pendingAmount && this.amount) {
      this.pendingAmount = this.amount - this.disbursedAmount;
    }
  }

  @BeforeUpdate()
  updatePendingAmount() {
    if (this.amount !== undefined && this.disbursedAmount !== undefined) {
      this.pendingAmount = this.amount - this.disbursedAmount;
    }
  }

  // Virtual properties
  @ApiProperty({
    description: 'Can the disbursement be processed',
    example: true,
    readOnly: true,
  })
  @Expose()
  get canBeProcessed(): boolean {
    return (this.status === DisbursementStatus.APPROVED || 
            this.status === DisbursementStatus.SCHEDULED) && 
            this.pendingAmount > 0;
  }

  @ApiProperty({
    description: 'Is disbursement complete',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isComplete(): boolean {
    return this.status === DisbursementStatus.COMPLETED || this.pendingAmount === 0;
  }

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
    description: 'Is disbursement approved',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isApproved(): boolean {
    return this.status === DisbursementStatus.APPROVED;
  }

  // Methods
  approve(approvedBy: string, notes?: string): void {
    this.status = DisbursementStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    if (notes) {
      this.approvalNotes = notes;
    }
  }

  scheduleDisbursement(scheduledDate: Date): void {
    this.status = DisbursementStatus.SCHEDULED;
    this.scheduledDate = scheduledDate;
  }

  disburse(amount?: number, transactionReference?: string): void {
    const disbursementAmount = amount || this.pendingAmount;
    
    this.disbursedAmount = (this.disbursedAmount || 0) + disbursementAmount;
    this.transactionReference = transactionReference;
    this.disbursedAt = new Date();
    
    if (this.disbursedAmount >= this.amount) {
      this.status = DisbursementStatus.COMPLETED;
    } else {
      this.status = DisbursementStatus.PARTIAL;
    }
    
    this.updatePendingAmount();
  }

  fail(reason: string): void {
    this.status = DisbursementStatus.FAILED;
    this.failureReason = reason;
  }

  cancel(cancelledBy: string, reason: string): void {
    this.status = DisbursementStatus.CANCELLED;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }

  createSchedule(installments: Array<{ amount: number; dueDate: Date }>): void {
    this.schedule = installments.map((installment, index) => ({
      ...installment,
      status: index === 0 ? 'pending' : 'scheduled',
    }));
  }

  // JSON serialization
  toJSON(): Partial<Disbursement> {
    return {
      id: this.id,
      disbursementNumber: this.disbursementNumber,
      amount: this.amount,
      disbursedAmount: this.disbursedAmount,
      pendingAmount: this.pendingAmount,
      currency: this.currency,
      status: this.status,
      scheduledDate: this.scheduledDate,
      disbursedAt: this.disbursedAt,
      transactionReference: this.transactionReference,
      canBeProcessed: this.canBeProcessed,
      isComplete: this.isComplete,
      isPending: this.isPending,
      isApproved: this.isApproved,
      schedule: this.schedule,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}