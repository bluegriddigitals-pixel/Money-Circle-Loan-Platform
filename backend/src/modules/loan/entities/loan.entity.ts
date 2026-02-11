import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
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
  IsUUID,
  IsNotEmpty,
  Min,
  Max,
  IsInt,
  ValidateNested,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { User } from '../../user/entities/user.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanCollateral } from './loan-collateral.entity';
import { LoanDocument } from './loan-document.entity';
import { LoanGuarantor } from './loan-guarantor.entity';
import { LoanRepayment } from './loan-repayment.entity';

export enum LoanStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FUNDING = 'funding',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  WRITTEN_OFF = 'written_off',
  RESTRUCTURED = 'restructured',
}

export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EDUCATION = 'education',
  HOME = 'home',
  AUTO = 'auto',
  DEBT_CONSOLIDATION = 'debt_consolidation',
  PAYDAY = 'payday',
  OTHER = 'other',
}

export enum RepaymentFrequency {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

@Entity('loans')
@Index(['loanNumber'], { unique: true })
@Index(['borrowerId'])
@Index(['status'])
@Index(['disbursementDate'])
@Index(['createdAt'])
export class Loan {
  @ApiProperty({
    description: 'Unique identifier for the loan',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique loan number',
    example: 'LN-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  loanNumber: string;

  @ApiPropertyOptional({
    description: 'ID of the loan application (if originated from application)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanApplicationId: string;

  @ApiProperty({
    description: 'Borrower user ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  @IsNotEmpty()
  borrowerId: string;

  @ApiProperty({
    description: 'Loan amount',
    example: 50000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Loan tenure in months',
    example: 36,
    minimum: 1,
    maximum: 360,
  })
  @Column({ type: 'int', nullable: false })
  @IsInt()
  @Min(1)
  @Max(360)
  @IsNotEmpty()
  tenureMonths: number;

  @ApiProperty({
    description: 'Interest rate (annual percentage)',
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  interestRate: number;

  @ApiPropertyOptional({
    description: 'Loan type',
    enum: LoanType,
    example: LoanType.PERSONAL,
    default: LoanType.PERSONAL,
  })
  @Column({
    type: 'enum',
    enum: LoanType,
    default: LoanType.PERSONAL,
    nullable: false,
  })
  @IsEnum(LoanType)
  type: LoanType;

  @ApiProperty({
    description: 'Loan status',
    enum: LoanStatus,
    example: LoanStatus.ACTIVE,
    default: LoanStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.DRAFT,
    nullable: false,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiPropertyOptional({
    description: 'Loan purpose',
    example: 'Home renovation',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  purpose: string;

  @ApiPropertyOptional({
    description: 'Repayment frequency',
    enum: RepaymentFrequency,
    example: RepaymentFrequency.MONTHLY,
    default: RepaymentFrequency.MONTHLY,
  })
  @Column({
    type: 'enum',
    enum: RepaymentFrequency,
    default: RepaymentFrequency.MONTHLY,
    nullable: false,
  })
  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({
    description: 'Amount already paid',
    example: 15000.00,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({
    description: 'Outstanding balance',
    example: 35000.00,
    minimum: 0,
    default: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  outstandingBalance: number;

  @ApiPropertyOptional({
    description: 'Total interest amount',
    example: 11250.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalInterest: number;

  @ApiPropertyOptional({
    description: 'Total fees amount',
    example: 500.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalFees: number;

  @ApiPropertyOptional({
    description: 'Monthly installment amount',
    example: 1500.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyInstallment: number;

  @ApiPropertyOptional({
    description: 'Disbursement date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  disbursementDate: Date;

  @ApiPropertyOptional({
    description: 'First repayment date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  firstRepaymentDate: Date;

  @ApiPropertyOptional({
    description: 'Last repayment date (maturity date)',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastRepaymentDate: Date;

  @ApiPropertyOptional({
    description: 'Approval date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvedAt: Date;

  @ApiPropertyOptional({
    description: 'Approved by user ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Rejection date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedAt: Date;

  @ApiPropertyOptional({
    description: 'Rejection reason',
    example: 'Insufficient credit score',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Default date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  defaultedAt: Date;

  @ApiPropertyOptional({
    description: 'Default reason',
    example: 'Missed 3 consecutive payments',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  defaultReason: string;

  @ApiPropertyOptional({
    description: 'Completion date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt: Date;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiPropertyOptional({
    description: 'Grace period in days',
    example: 15,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'int', default: 0, nullable: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  gracePeriodDays: number;

  @ApiPropertyOptional({
    description: 'Late payment penalty percentage',
    example: 2.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  latePenaltyRate: number;

  @ApiPropertyOptional({
    description: 'Late payment penalty amount',
    example: 50.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  latePenaltyAmount: number;

  @ApiPropertyOptional({
    description: 'Number of late payments',
    example: 2,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'int', default: 0, nullable: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  latePaymentCount: number;

  @ApiPropertyOptional({
    description: 'Number of missed payments',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'int', default: 0, nullable: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  missedPaymentCount: number;

  @ApiPropertyOptional({
    description: 'Risk rating',
    example: 'A',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  @IsString()
  riskRating: string;

  @ApiPropertyOptional({
    description: 'Credit score at disbursement',
    example: 720,
    minimum: 300,
    maximum: 850,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(850)
  creditScoreAtDisbursement: number;

  @ApiPropertyOptional({
    description: 'Debt-to-income ratio',
    example: 35.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  debtToIncomeRatio: number;

  @ApiPropertyOptional({
    description: 'Collateral coverage ratio',
    example: 1.5,
    minimum: 0,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  collateralCoverageRatio: number;

  @ApiPropertyOptional({
    description: 'Total collateral value',
    example: 75000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCollateralValue: number;

  @ApiPropertyOptional({
    description: 'Loan-to-value ratio',
    example: 66.67,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  loanToValueRatio: number;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['secured', 'high_value', 'repeat_customer'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'web', campaign: 'summer2024', referrer: 'google' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Customer is a high net worth individual',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiProperty({
    description: 'Loan creation timestamp',
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
    description: 'Borrower user',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.loans, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'borrowerId' })
  @ValidateNested()
  @Type(() => User)
  borrower: User;

  @ApiPropertyOptional({
    description: 'Loan application that originated this loan',
    type: () => LoanApplication,
  })
  @OneToOne(() => LoanApplication, (application) => application.loan, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'loanApplicationId' })
  @ValidateNested()
  @Type(() => LoanApplication)
  loanApplication: LoanApplication;

  @ApiPropertyOptional({
    description: 'Collateral securing this loan',
    type: () => [LoanCollateral],
  })
  @OneToMany(() => LoanCollateral, (collateral) => collateral.loan, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanCollateral)
  collaterals: LoanCollateral[];

  @ApiPropertyOptional({
    description: 'Documents attached to this loan',
    type: () => [LoanDocument],
  })
  @OneToMany(() => LoanDocument, (document) => document.loan, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanDocument)
  documents: LoanDocument[];

  @ApiPropertyOptional({
    description: 'Guarantors for this loan',
    type: () => [LoanGuarantor],
  })
  @OneToMany(() => LoanGuarantor, (guarantor) => guarantor.loan, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanGuarantor)
  guarantors: LoanGuarantor[];

  @ApiPropertyOptional({
    description: 'Repayment schedule for this loan',
    type: () => [LoanRepayment],
  })
  @OneToMany(() => LoanRepayment, (repayment) => repayment.loan, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanRepayment)
  repayments: LoanRepayment[];

  // Lifecycle hooks
  @BeforeInsert()
  async beforeInsert() {
    if (!this.loanNumber) {
      this.loanNumber = this.generateLoanNumber();
    }
    this.outstandingBalance = this.amount;
    this.calculateMonthlyInstallment();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    this.version += 1;
    this.calculateOutstandingBalance();
    this.updateLoanStatus();
  }

  @AfterInsert()
  async afterInsert() {
    console.log(`Loan created: ${this.loanNumber} (${this.id})`);
  }

  @AfterUpdate()
  async afterUpdate() {
    console.log(`Loan updated: ${this.loanNumber} (${this.id})`);
  }

  // Business logic methods
  private generateLoanNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `LN-${year}-${random}`;
  }

  private calculateMonthlyInstallment(): void {
    if (this.amount && this.interestRate && this.tenureMonths) {
      const monthlyRate = this.interestRate / 100 / 12;
      const factor = Math.pow(1 + monthlyRate, this.tenureMonths);
      this.monthlyInstallment = this.amount * (monthlyRate * factor) / (factor - 1);
      this.totalInterest = (this.monthlyInstallment * this.tenureMonths) - this.amount;
    }
  }

  private calculateOutstandingBalance(): void {
    this.outstandingBalance = Math.max(0, (this.amount + (this.totalInterest || 0) + (this.totalFees || 0)) - this.amountPaid);
  }

  private updateLoanStatus(): void {
    if (this.outstandingBalance <= 0 && this.status === LoanStatus.ACTIVE) {
      this.status = LoanStatus.COMPLETED;
      this.completedAt = new Date();
    }
  }

  // Computed properties
  @ApiProperty({
    description: 'Progress percentage (amount paid / total amount)',
    example: 42.86,
    readOnly: true,
  })
  @Expose()
  get progressPercentage(): number {
    if (!this.amount) return 0;
    return (this.amountPaid / this.amount) * 100;
  }

  @ApiProperty({
    description: 'Remaining months',
    example: 24,
    readOnly: true,
  })
  @Expose()
  get remainingMonths(): number | null {
    if (!this.tenureMonths || !this.createdAt) return null;
    
    const startDate = this.disbursementDate || this.createdAt;
    const elapsedMonths = this.getMonthDifference(new Date(), startDate);
    return Math.max(0, this.tenureMonths - elapsedMonths);
  }

  private getMonthDifference(date1: Date, date2: Date): number {
    const years = date1.getFullYear() - date2.getFullYear();
    const months = date1.getMonth() - date2.getMonth();
    return years * 12 + months;
  }

  @ApiProperty({
    description: 'Is loan active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.status === LoanStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Is loan completed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCompleted(): boolean {
    return this.status === LoanStatus.COMPLETED;
  }

  @ApiProperty({
    description: 'Is loan defaulted',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isDefaulted(): boolean {
    return this.status === LoanStatus.DEFAULTED;
  }

  @ApiProperty({
    description: 'Is loan approved',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isApproved(): boolean {
    return this.status === LoanStatus.APPROVED;
  }

  @ApiProperty({
    description: 'Is loan funded',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFunded(): boolean {
    return this.status === LoanStatus.FUNDING || this.status === LoanStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Days since disbursement',
    example: 180,
    readOnly: true,
  })
  @Expose()
  get daysSinceDisbursement(): number | null {
    if (!this.disbursementDate) return null;
    const today = new Date();
    const disbursement = new Date(this.disbursementDate);
    const diffTime = today.getTime() - disbursement.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Days until maturity',
    example: 365,
    readOnly: true,
  })
  @Expose()
  get daysUntilMaturity(): number | null {
    if (!this.lastRepaymentDate) return null;
    const today = new Date();
    const maturity = new Date(this.lastRepaymentDate);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Business methods
  approve(approvedBy: string): void {
    if (this.status !== LoanStatus.PENDING_APPROVAL && this.status !== LoanStatus.DRAFT) {
      throw new Error('Loan must be in pending approval or draft status to approve');
    }
    this.status = LoanStatus.APPROVED;
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
  }

  reject(reason: string, rejectedBy: string): void {
    if (this.status !== LoanStatus.PENDING_APPROVAL && this.status !== LoanStatus.DRAFT) {
      throw new Error('Loan must be in pending approval or draft status to reject');
    }
    this.status = LoanStatus.REJECTED;
    this.rejectionReason = reason;
    this.rejectedAt = new Date();
    this.approvedBy = rejectedBy;
  }

  disburse(disbursementDate: Date = new Date()): void {
    if (this.status !== LoanStatus.APPROVED) {
      throw new Error('Only approved loans can be disbursed');
    }
    this.status = LoanStatus.FUNDING;
    this.disbursementDate = disbursementDate;
    
    // Set first repayment date (30 days after disbursement)
    const firstRepayment = new Date(disbursementDate);
    firstRepayment.setDate(firstRepayment.getDate() + 30);
    this.firstRepaymentDate = firstRepayment;
    
    // Set last repayment date (tenure months after first repayment)
    const lastRepayment = new Date(firstRepayment);
    lastRepayment.setMonth(lastRepayment.getMonth() + this.tenureMonths - 1);
    this.lastRepaymentDate = lastRepayment;
  }

  activate(): void {
    if (this.status !== LoanStatus.FUNDING) {
      throw new Error('Only funding loans can be activated');
    }
    this.status = LoanStatus.ACTIVE;
  }

  markAsDefaulted(reason: string): void {
    if (this.status !== LoanStatus.ACTIVE) {
      throw new Error('Only active loans can be defaulted');
    }
    this.status = LoanStatus.DEFAULTED;
    this.defaultedAt = new Date();
    this.defaultReason = reason;
  }

  writeOff(): void {
    if (this.status !== LoanStatus.DEFAULTED) {
      throw new Error('Only defaulted loans can be written off');
    }
    this.status = LoanStatus.WRITTEN_OFF;
  }

  restructure(newAmount: number, newTenure: number, newRate: number): void {
    if (this.status !== LoanStatus.ACTIVE && this.status !== LoanStatus.DEFAULTED) {
      throw new Error('Only active or defaulted loans can be restructured');
    }
    
    this.amount = newAmount;
    this.tenureMonths = newTenure;
    this.interestRate = newRate;
    this.status = LoanStatus.RESTRUCTURED;
    this.calculateMonthlyInstallment();
    this.calculateOutstandingBalance();
  }

  recordPayment(amount: number): void {
    if (amount <= 0) {
      throw new Error('Payment amount must be positive');
    }
    
    this.amountPaid += amount;
    this.calculateOutstandingBalance();
  }

  addCollateral(collateral: LoanCollateral): void {
    if (!this.collaterals) this.collaterals = [];
    this.collaterals.push(collateral);
    this.updateCollateralMetrics();
  }

  removeCollateral(collateralId: string): void {
    if (this.collaterals) {
      this.collaterals = this.collaterals.filter(c => c.id !== collateralId);
      this.updateCollateralMetrics();
    }
  }

  private updateCollateralMetrics(): void {
    if (this.collaterals && this.collaterals.length > 0) {
      this.totalCollateralValue = this.collaterals.reduce(
        (sum, collateral) => sum + (collateral.appraisedValue || 0), 
        0
      );
      
      if (this.totalCollateralValue > 0) {
        this.collateralCoverageRatio = this.amount / this.totalCollateralValue;
        this.loanToValueRatio = (this.amount / this.totalCollateralValue) * 100;
      }
    }
  }

  getSummary(): {
    id: string;
    loanNumber: string;
    amount: number;
    outstandingBalance: number;
    monthlyInstallment: number;
    interestRate: number;
    status: LoanStatus;
    progress: number;
    nextPaymentDate?: Date;
  } {
    let nextPaymentDate: Date | undefined;
    
    if (this.repayments) {
      const nextPayment = this.repayments
        .filter(r => r.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      
      if (nextPayment) {
        nextPaymentDate = nextPayment.dueDate;
      }
    }

    return {
      id: this.id,
      loanNumber: this.loanNumber,
      amount: this.amount,
      outstandingBalance: this.outstandingBalance,
      monthlyInstallment: this.monthlyInstallment || 0,
      interestRate: this.interestRate,
      status: this.status,
      progress: this.progressPercentage,
      nextPaymentDate,
    };
  }

  // JSON serialization
  toJSON(): Partial<Loan> {
    return {
      id: this.id,
      loanNumber: this.loanNumber,
      amount: this.amount,
      tenureMonths: this.tenureMonths,
      interestRate: this.interestRate,
      type: this.type,
      status: this.status,
      purpose: this.purpose,
      amountPaid: this.amountPaid,
      outstandingBalance: this.outstandingBalance,
      monthlyInstallment: this.monthlyInstallment,
      disbursementDate: this.disbursementDate,
      firstRepaymentDate: this.firstRepaymentDate,
      lastRepaymentDate: this.lastRepaymentDate,
      isActive: this.isActive,
      isCompleted: this.isCompleted,
      isDefaulted: this.isDefaulted,
      progressPercentage: this.progressPercentage,
      remainingMonths: this.remainingMonths,
      daysSinceDisbursement: this.daysSinceDisbursement,
      daysUntilMaturity: this.daysUntilMaturity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}