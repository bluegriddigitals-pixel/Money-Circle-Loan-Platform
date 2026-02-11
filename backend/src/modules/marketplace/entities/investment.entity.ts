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
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { User } from '../../user/entities/user.entity';
import { Loan } from '../../loan/entities/loan.entity';

export enum InvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

export enum InvestmentType {
  MANUAL = 'manual',
  AUTO = 'auto',
}

@Entity('investments')
@Index(['investmentNumber'], { unique: true })
@Index(['investorId'])
@Index(['loanId'])
@Index(['status'])
@Index(['createdAt'])
export class Investment {
  @ApiProperty({
    description: 'Unique identifier for the investment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique investment number',
    example: 'INV-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  investmentNumber: string;

  @ApiProperty({
    description: 'Investor user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  investorId: string;

  @ApiProperty({
    description: 'Loan ID being invested in',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  loanId: string;

  @ApiProperty({
    description: 'Investment amount',
    example: 5000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Investment currency',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Interest rate at time of investment',
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiProperty({
    description: 'Investment status',
    enum: InvestmentStatus,
    example: InvestmentStatus.ACTIVE,
    default: InvestmentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.PENDING,
    nullable: false,
  })
  @IsEnum(InvestmentStatus)
  status: InvestmentStatus;

  @ApiProperty({
    description: 'Investment type',
    enum: InvestmentType,
    example: InvestmentType.MANUAL,
    default: InvestmentType.MANUAL,
  })
  @Column({
    type: 'enum',
    enum: InvestmentType,
    default: InvestmentType.MANUAL,
    nullable: false,
  })
  @IsEnum(InvestmentType)
  type: InvestmentType;

  @ApiPropertyOptional({
    description: 'Investment date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  investmentDate: Date;

  @ApiPropertyOptional({
    description: 'Maturity date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  maturityDate: Date;

  @ApiPropertyOptional({
    description: 'Expected return amount',
    example: 5625.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedReturn: number;

  @ApiProperty({
    description: 'Amount returned so far',
    example: 1250.00,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  amountReturned: number;

  @ApiProperty({
    description: 'Remaining balance',
    example: 3750.00,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  remainingBalance: number;

  @ApiPropertyOptional({
    description: 'Cancellation date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  cancelledAt: Date;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Loan cancelled',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { autoInvestRuleId: '123', riskScore: 'A' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Investment creation timestamp',
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
  @ManyToOne(() => User, (user) => user.investments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'investorId' })
  investor: User;

  @ManyToOne(() => Loan, (loan) => loan.investments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  // Lifecycle hooks
  @BeforeInsert()
  generateInvestmentNumber() {
    if (!this.investmentNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.investmentNumber = `INV-${year}-${random}`;
    }
    if (this.amount && this.interestRate && this.maturityDate) {
      const months = this.getMonthDifference(new Date(this.maturityDate), new Date());
      const monthlyRate = this.interestRate / 100 / 12;
      this.expectedReturn = this.amount * Math.pow(1 + monthlyRate, months);
    }
    this.remainingBalance = this.amount - this.amountReturned;
  }

  private getMonthDifference(date1: Date, date2: Date): number {
    const years = date1.getFullYear() - date2.getFullYear();
    const months = date1.getMonth() - date2.getMonth();
    return Math.max(0, years * 12 + months);
  }

  // Virtual properties
  @ApiProperty({
    description: 'Return on investment percentage',
    example: 12.5,
    readOnly: true,
  })
  @Expose()
  get roi(): number {
    if (!this.amount || this.amount === 0) return 0;
    const profit = (this.amountReturned || 0) - this.amount;
    return (profit / this.amount) * 100;
  }

  @ApiProperty({
    description: 'Progress percentage',
    example: 25,
    readOnly: true,
  })
  @Expose()
  get progressPercentage(): number {
    if (!this.amount || this.amount === 0) return 0;
    return (this.amountReturned / this.amount) * 100;
  }

  @ApiProperty({
    description: 'Is investment active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.status === InvestmentStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Is investment completed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCompleted(): boolean {
    return this.status === InvestmentStatus.COMPLETED;
  }

  // Methods
  recordReturn(amount: number): void {
    this.amountReturned += amount;
    this.remainingBalance = this.amount - this.amountReturned;
    
    if (this.remainingBalance <= 0) {
      this.status = InvestmentStatus.COMPLETED;
    }
  }

  cancel(reason: string): void {
    this.status = InvestmentStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }

  // JSON serialization
  toJSON(): Partial<Investment> {
    return {
      id: this.id,
      investmentNumber: this.investmentNumber,
      amount: this.amount,
      currency: this.currency,
      interestRate: this.interestRate,
      status: this.status,
      type: this.type,
      investmentDate: this.investmentDate,
      maturityDate: this.maturityDate,
      expectedReturn: this.expectedReturn,
      amountReturned: this.amountReturned,
      remainingBalance: this.remainingBalance,
      roi: this.roi,
      progressPercentage: this.progressPercentage,
      isActive: this.isActive,
      isCompleted: this.isCompleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}