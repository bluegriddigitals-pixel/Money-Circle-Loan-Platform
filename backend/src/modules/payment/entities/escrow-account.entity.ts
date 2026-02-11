import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
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
  IsEmail,
  IsPhoneNumber,
  Min,
  Max,
  IsInt,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { DecimalColumn } from "../../../shared/decorators/decimal-column.decorator";
import { Loan } from '../../loan/entities/loan.entity';
import { Transaction } from './transaction.entity';
import { EscrowAccountType, EscrowAccountStatus } from "../enums/escrow.enum";

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
    default: EscrowAccountStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: EscrowAccountStatus,
    default: EscrowAccountStatus.ACTIVE,
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
    description: 'Hold conditions',
    example: ['dispute_filed', 'regulatory_hold', 'fraud_investigation'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  holdConditions: string[];

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
    description: 'Interest accrued',
    example: 250.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  interestAccrued: number;

  @ApiPropertyOptional({
    description: 'Fees charged',
    example: 100.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  feesCharged: number;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['loan_disbursement', 'high_value', 'urgent'],
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
    example: 'Escrow for initial loan disbursement',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Requires regulatory approval before release',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

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
    description: 'Transactions related to this escrow account',
    type: () => [Transaction],
  })
  @OneToMany(() => Transaction, (transaction) => transaction.escrowAccount)
  transactions: Transaction[];

  // Virtual/computed properties
  @ApiProperty({
    description: 'Total amount deposited',
    example: 50000.0,
    readOnly: true,
  })
  @Expose()
  get totalDeposits(): number {
    if (!this.transactions) return 0;
    return this.transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  @ApiProperty({
    description: 'Total amount withdrawn',
    example: 20000.0,
    readOnly: true,
  })
  @Expose()
  get totalWithdrawals(): number {
    if (!this.transactions) return 0;
    return this.transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  @ApiProperty({
    description: 'Available balance (current - holds)',
    example: 30000.0,
    readOnly: true,
  })
  @Expose()
  get availableBalance(): number {
    const holds = this.transactions?.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0;
    return Math.max(0, this.currentBalance - holds);
  }

  @ApiProperty({
    description: 'Is escrow account active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.status === EscrowAccountStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Is escrow account frozen',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFrozen(): boolean {
    return this.status === EscrowAccountStatus.FROZEN;
  }

  @ApiProperty({
    description: 'Is escrow account mature/releasable',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isMature(): boolean {
    if (!this.maturityDate) return false;
    return new Date() >= this.maturityDate;
  }

  @ApiProperty({
    description: 'Days until maturity',
    example: 15,
    readOnly: true,
  })
  @Expose()
  get daysUntilMaturity(): number | null {
    if (!this.maturityDate) return null;
    const today = new Date();
    const maturity = new Date(this.maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Lifecycle hooks
  @BeforeInsert()
  generateAccountNumber() {
    if (!this.accountNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.accountNumber = `ESC-${year}-${random}`;
    }
  }

  @BeforeUpdate()
  updateVersion() {
    this.version += 1;
  }

  // Business logic methods
  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    if (this.isFrozen) {
      throw new Error('Cannot deposit to frozen account');
    }

    this.currentBalance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (this.isFrozen) {
      throw new Error('Cannot withdraw from frozen account');
    }

    if (amount > this.availableBalance) {
      throw new Error('Insufficient available balance');
    }

    this.currentBalance -= amount;
  }

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

  addInterest(): void {
    if (this.interestRate && this.interestRate > 0 && this.currentBalance > 0) {
      const dailyRate = this.interestRate / 36500;
      const interest = this.currentBalance * dailyRate;
      this.interestAccrued += interest;
      this.currentBalance += interest;
    }
  }

  chargeFee(feeAmount: number, feeType: string = 'service_fee'): void {
    if (feeAmount <= 0) {
      throw new Error('Fee amount must be positive');
    }

    if (feeAmount > this.currentBalance) {
      throw new Error('Insufficient balance to charge fee');
    }

    this.feesCharged += feeAmount;
    this.currentBalance -= feeAmount;

    if (!this.metadata) this.metadata = {};
    if (!this.metadata.feeHistory) this.metadata.feeHistory = [];
    this.metadata.feeHistory.push({
      date: new Date(),
      amount: feeAmount,
      type: feeType,
    });
  }

  // Validation methods
  @Expose()
  get isValid(): boolean {
    return (
      !!this.accountNumber &&
      !!this.accountName &&
      !!this.holderName &&
      this.currentBalance >= 0
    );
  }

  @Expose()
  get isOverMaximum(): boolean {
    if (!this.maximumBalance) return false;
    return this.currentBalance > this.maximumBalance;
  }

  @Expose()
  get isUnderMinimum(): boolean {
    if (!this.minimumBalance) return false;
    return this.currentBalance < this.minimumBalance;
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

  addReleaseCondition(condition: string): void {
    if (!this.releaseConditions) this.releaseConditions = [];
    if (!this.releaseConditions.includes(condition)) {
      this.releaseConditions.push(condition);
    }
  }

  addHoldCondition(condition: string): void {
    if (!this.holdConditions) this.holdConditions = [];
    if (!this.holdConditions.includes(condition)) {
      this.holdConditions.push(condition);
    }
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
      isActive: this.isActive,
      isFrozen: this.isFrozen,
      isMature: this.isMature,
      daysUntilMaturity: this.daysUntilMaturity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}