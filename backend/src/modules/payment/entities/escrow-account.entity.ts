import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
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
  Max,
  IsObject,
  IsArray,
  MaxLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from '../../loan/entities/loan.entity';
import { Transaction } from './transaction.entity';
import { Disbursement } from './disbursement.entity';
import { PayoutRequest } from './payout-request.entity';

// ============================================
// IMPORT ENUMS FROM ENUMS FOLDER - NOT DEFINED HERE
// ============================================
import { 
    EscrowAccountType, 
    EscrowAccountStatus 
} from '../enums/escrow.enum';

@Entity('escrow_accounts')
@Index(['accountNumber'], { unique: true })
@Index(['loanId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class EscrowAccount {
  @ApiProperty({
    description: 'Unique identifier for the escrow account',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique escrow account number',
    example: 'ESC-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({
    description: 'ID of the associated loan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanId: string;

  @ApiProperty({
    description: 'Escrow account name',
    example: 'Loan Disbursement Escrow - Loan #L2024-001',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  accountName: string;

  @ApiProperty({
    description: 'Escrow account type',
    enum: EscrowAccountType,
    example: EscrowAccountType.LOAN_DISBURSEMENT,
    default: EscrowAccountType.GENERAL,
  })
  @Column({
    type: 'enum',
    enum: EscrowAccountType,
    default: EscrowAccountType.GENERAL,
    nullable: false,
  })
  @IsEnum(EscrowAccountType)
  type: EscrowAccountType;

  @ApiProperty({
    description: 'Current balance in the escrow account',
    example: 50000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  currentBalance: number;

  @ApiProperty({
    description: 'Available balance (current - pending holds)',
    example: 45000.0,
    minimum: 0,
    readOnly: true,
  })
  @Expose()
  get availableBalance(): number {
    const pendingHolds = this.transactions
      ?.filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    return Math.max(0, this.currentBalance - pendingHolds);
  }

  @ApiProperty({
    description: 'Initial deposit amount',
    example: 50000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  initialAmount: number;

  @ApiPropertyOptional({
    description: 'Minimum required balance',
    example: 1000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance: number;

  @ApiPropertyOptional({
    description: 'Maximum allowed balance',
    example: 100000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumBalance: number;

  @ApiProperty({
    description: 'Escrow account status',
    enum: EscrowAccountStatus,
    example: EscrowAccountStatus.ACTIVE,
    default: EscrowAccountStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: EscrowAccountStatus,
    default: EscrowAccountStatus.PENDING,
    nullable: false,
  })
  @IsEnum(EscrowAccountStatus)
  status: EscrowAccountStatus;

  @ApiProperty({
    description: 'Escrow holder name',
    example: 'John Smith',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  holderName: string;

  @ApiPropertyOptional({
    description: 'Escrow holder email',
    example: 'john.smith@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  holderEmail: string;

  @ApiPropertyOptional({
    description: 'Escrow holder phone',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  holderPhone: string;

  @ApiPropertyOptional({
    description: 'Beneficiary name',
    example: 'Jane Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  beneficiaryName: string;

  @ApiPropertyOptional({
    description: 'Beneficiary email',
    example: 'jane.doe@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  beneficiaryEmail: string;

  @ApiPropertyOptional({
    description: 'Bank account details for withdrawals',
    example: {
      bankName: 'First National Bank',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      accountType: 'checking',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  bankAccount: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Release conditions',
    example: ['loan_approval', 'contract_signing', 'property_inspection'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  releaseConditions: string[];

  @ApiPropertyOptional({
    description: 'Interest rate for funds held',
    example: 2.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiPropertyOptional({
    description: 'Maturity/Release date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  maturityDate: Date;

  @ApiPropertyOptional({
    description: 'Date when account was closed',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  closedAt: Date;

  @ApiPropertyOptional({
    description: 'Date when account was frozen',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  frozenAt: Date;

  @ApiPropertyOptional({
    description: 'Frozen reason',
    example: 'Suspicious activity detected',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  frozenReason: string;

  @ApiPropertyOptional({
    description: 'Close reason',
    example: 'Loan fully repaid and released',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  closeReason: string;

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
    example: 'Escrow for initial loan disbursement',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'Escrow account creation timestamp',
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
  @ApiPropertyOptional({
    description: 'Loan associated with this escrow account',
    type: () => Loan,
  })
  @ManyToOne(() => Loan, (loan) => loan.escrowAccounts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Transactions for this escrow account',
    type: () => [Transaction],
  })
  @OneToMany(() => Transaction, (transaction) => transaction.escrowAccount)
  transactions: Transaction[];

  @ApiPropertyOptional({
    description: 'Disbursements from this escrow account',
    type: () => [Disbursement],
  })
  @OneToMany(() => Disbursement, (disbursement) => disbursement.escrowAccount, {
    cascade: true,
    eager: false,
  })
  disbursements: Disbursement[];

  @ApiPropertyOptional({
    description: 'Payout requests from this escrow account',
    type: () => [PayoutRequest],
  })
  @OneToMany(() => PayoutRequest, (payout) => payout.escrowAccount, {
    cascade: true,
    eager: false,
  })
  payoutRequests: PayoutRequest[];

  // Business logic methods
  freeze(reason: string): void {
    this.status = EscrowAccountStatus.FROZEN;
    this.frozenAt = new Date();
    this.frozenReason = reason;
  }

  unfreeze(): void {
    if (this.status === EscrowAccountStatus.FROZEN) {
      this.status = EscrowAccountStatus.ACTIVE;
      this.frozenAt = null;
      this.frozenReason = null;
    }
  }

  close(reason: string): void {
    if (this.currentBalance > 0) {
      throw new Error('Cannot close account with positive balance');
    }
    this.status = EscrowAccountStatus.CLOSED;
    this.closedAt = new Date();
    this.closeReason = reason;
  }

  // JSON serialization
  toJSON(): Partial<EscrowAccount> {
    return {
      id: this.id,
      accountNumber: this.accountNumber,
      accountName: this.accountName,
      type: this.type,
      status: this.status,
      currentBalance: this.currentBalance,
      availableBalance: this.availableBalance,
      holderName: this.holderName,
      beneficiaryName: this.beneficiaryName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}