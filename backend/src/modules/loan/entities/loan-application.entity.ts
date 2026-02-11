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
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsPositive,
  IsNotEmpty,
  IsInt,
  MaxLength,
  MinLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { User } from '../../user/entities/user.entity';
import { Loan } from './loan.entity';
import { LoanDocument } from './loan-document.entity';
import { LoanCollateral } from './loan-collateral.entity';
import { LoanGuarantor } from './loan-guarantor.entity';

export enum LoanPurpose {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EDUCATION = 'education',
  MEDICAL = 'medical',
  HOME_RENOVATION = 'home_renovation',
  DEBT_CONSOLIDATION = 'debt_consolidation',
  VEHICLE_PURCHASE = 'vehicle_purchase',
  WEDDING = 'wedding',
  TRAVEL = 'travel',
  EMERGENCY = 'emergency',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self_employed',
  UNEMPLOYED = 'unemployed',
  RETIRED = 'retired',
  STUDENT = 'student',
  BUSINESS_OWNER = 'business_owner',
  FREELANCER = 'freelancer',
  CONTRACTOR = 'contractor',
}

export enum IncomeFrequency {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
  BI_MONTHLY = 'bi_monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  IRREGULAR = 'irregular',
}

export enum LoanApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING_DOCUMENTS = 'pending_documents',
  PENDING_APPROVAL = 'pending_approval',
  PENDING_DISBURSEMENT = 'pending_disbursement',
  DISBURSED = 'disbursed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ON_HOLD = 'on_hold',
}

export enum RiskCategory {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum ApplicationSource {
  WEB = 'web',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  PARTNER = 'partner',
  AGENT = 'agent',
  BRANCH = 'branch',
  CALL_CENTER = 'call_center',
}

@Entity('loan_applications')
@Index(['applicationNumber'], { unique: true })
@Index(['borrowerId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['loanPurpose'])
@Index(['riskCategory'])
@Index(['loanId'], { unique: true, where: 'loan_id IS NOT NULL' })
export class LoanApplication {
  @ApiProperty({
    description: 'Unique identifier for the loan application',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique application number',
    example: 'APP-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @MaxLength(50)
  applicationNumber: string;

  @ApiProperty({
    description: 'ID of the borrower/user',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  borrowerId: string;

  @ApiProperty({
    description: 'Purpose of the loan',
    enum: LoanPurpose,
    example: LoanPurpose.BUSINESS,
  })
  @Column({
    type: 'enum',
    enum: LoanPurpose,
    nullable: false,
  })
  @IsEnum(LoanPurpose)
  loanPurpose: LoanPurpose;

  @ApiPropertyOptional({
    description: 'Detailed description of loan purpose',
    example: 'Expanding my retail business by opening a new store location',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  purposeDescription: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 50000.0,
    minimum: 1,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @IsPositive()
  @Min(1)
  requestedAmount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    description: 'Requested loan term in months',
    example: 24,
    minimum: 1,
    maximum: 360,
  })
  @Column({ type: 'integer', nullable: false })
  @IsInt()
  @Min(1)
  @Max(360)
  requestedTermMonths: number;

  @ApiPropertyOptional({
    description: 'Desired interest rate (if any specific preference)',
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  desiredInterestRate: number;

  @ApiProperty({
    description: 'Monthly income of the applicant',
    example: 5000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @IsPositive()
  monthlyIncome: number;

  @ApiProperty({
    description: 'Employment status',
    enum: EmploymentStatus,
    example: EmploymentStatus.EMPLOYED,
  })
  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    nullable: false,
  })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @ApiPropertyOptional({
    description: 'Company/employer name',
    example: 'Tech Solutions Inc.',
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  employerName: string;

  @ApiPropertyOptional({
    description: 'Job title/position',
    example: 'Senior Software Engineer',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle: string;

  @ApiPropertyOptional({
    description: 'Employment duration in months',
    example: 36,
    minimum: 0,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  employmentDurationMonths: number;

  @ApiProperty({
    description: 'Income frequency',
    enum: IncomeFrequency,
    example: IncomeFrequency.MONTHLY,
  })
  @Column({
    type: 'enum',
    enum: IncomeFrequency,
    nullable: false,
  })
  @IsEnum(IncomeFrequency)
  incomeFrequency: IncomeFrequency;

  @ApiPropertyOptional({
    description: 'Additional monthly income sources',
    example: 1000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherMonthlyIncome: number;

  @ApiPropertyOptional({
    description: 'Description of other income sources',
    example: 'Freelance consulting and rental property',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  otherIncomeDescription: string;

  @ApiProperty({
    description: 'Total monthly expenses',
    example: 3000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  monthlyExpenses: number;

  @ApiPropertyOptional({
    description: 'Monthly debt obligations',
    example: 500.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyDebt: number;

  @ApiPropertyOptional({
    description: 'Total assets value',
    example: 150000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAssets: number;

  @ApiPropertyOptional({
    description: 'Total liabilities',
    example: 50000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLiabilities: number;

  @ApiPropertyOptional({
    description: 'Net worth (assets - liabilities)',
    example: 100000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  netWorth: number;

  @ApiProperty({
    description: 'Credit score at time of application',
    example: 720,
    minimum: 300,
    maximum: 850,
  })
  @Column({ type: 'integer', nullable: false })
  @IsInt()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiPropertyOptional({
    description: 'Credit bureau report data (stored as JSON)',
    example: {
      bureau: 'Experian',
      reportDate: '2024-01-15',
      scoreFactors: ['payment_history', 'credit_utilization'],
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  creditReport: Record<string, any>;

  @ApiProperty({
    description: 'Loan application status',
    enum: LoanApplicationStatus,
    example: LoanApplicationStatus.SUBMITTED,
    default: LoanApplicationStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: LoanApplicationStatus,
    default: LoanApplicationStatus.DRAFT,
    nullable: false,
  })
  @IsEnum(LoanApplicationStatus)
  status: LoanApplicationStatus;

  @ApiPropertyOptional({
    description: 'Risk category assigned to the application',
    enum: RiskCategory,
    example: RiskCategory.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: RiskCategory,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(RiskCategory)
  riskCategory: RiskCategory;

  @ApiPropertyOptional({
    description: 'Risk score (0-100)',
    example: 65.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;

  @ApiPropertyOptional({
    description: 'Approved loan amount (if different from requested)',
    example: 45000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount: number;

  @ApiPropertyOptional({
    description: 'Approved interest rate',
    example: 14.5,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  approvedInterestRate: number;

  @ApiPropertyOptional({
    description: 'Approved loan term in months',
    example: 24,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  approvedTermMonths: number;

  @ApiPropertyOptional({
    description: 'Monthly repayment amount',
    example: 2150.75,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRepayment: number;

  @ApiPropertyOptional({
    description: 'Total repayment amount (principal + interest)',
    example: 51618.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalRepaymentAmount: number;

  @ApiPropertyOptional({
    description: 'Total interest amount',
    example: 6618.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalInterestAmount: number;

  @ApiPropertyOptional({
    description: 'Annual Percentage Rate (APR)',
    example: 15.2,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  apr: number;

  @ApiPropertyOptional({
    description: 'Platform/service fee',
    example: 500.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  platformFee: number;

  @ApiPropertyOptional({
    description: 'Insurance fee (if applicable)',
    example: 250.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceFee: number;

  @ApiPropertyOptional({
    description: 'Other fees',
    example: 100.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherFees: number;

  @ApiPropertyOptional({
    description: 'Disbursement amount (after deducting fees)',
    example: 49150.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  disbursementAmount: number;

  @ApiPropertyOptional({
    description: 'Reason for rejection (if applicable)',
    example: 'Insufficient income to support requested loan amount',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Additional notes/comments',
    example: 'Applicant has good payment history but high debt-to-income ratio',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes (not visible to applicant)',
    example: 'Requires additional verification of income documents',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  internalNotes: string;

  @ApiProperty({
    description: 'Application source',
    enum: ApplicationSource,
    example: ApplicationSource.WEB,
    default: ApplicationSource.WEB,
  })
  @Column({
    type: 'enum',
    enum: ApplicationSource,
    default: ApplicationSource.WEB,
    nullable: false,
  })
  @IsEnum(ApplicationSource)
  source: ApplicationSource;

  @ApiPropertyOptional({
    description: 'IP address from application submission',
    example: '192.168.1.100',
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  @IsOptional()
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'User agent from application submission',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  userAgent: string;

  @ApiPropertyOptional({
    description: 'Device fingerprint',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceFingerprint: string;

  @ApiPropertyOptional({
    description: 'Referral code used (if any)',
    example: 'REF12345',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referralCode: string;

  @ApiPropertyOptional({
    description: 'Campaign/source tracking parameters',
    example: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'business_loans',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  trackingParams: Record<string, string>;

  @ApiProperty({
    description: 'Whether application is submitted',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isSubmitted: boolean;

  @ApiPropertyOptional({
    description: 'Submission date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submittedAt: Date;

  @ApiPropertyOptional({
    description: 'Review start date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reviewStartDate: Date;

  @ApiPropertyOptional({
    description: 'Review end date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reviewEndDate: Date;

  @ApiPropertyOptional({
    description: 'Reviewer/underwriter user ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  reviewerId: string;

  @ApiPropertyOptional({
    description: 'Approval date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvedAt: Date;

  @ApiPropertyOptional({
    description: 'Approver user ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  approverId: string;

  @ApiPropertyOptional({
    description: 'Rejection date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedAt: Date;

  @ApiPropertyOptional({
    description: 'Cancellation date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelledAt: Date;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Found alternative funding',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Expiry date (if not approved within timeframe)',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Disbursement date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  disbursedAt: Date;

  @ApiPropertyOptional({
    description: 'ID of the created loan (if approved and disbursed)',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanId: string;

  @ApiProperty({
    description: 'Application creation timestamp',
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
    description: 'Borrower/user who submitted the application',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.loanApplications, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'borrowerId' })
  @ValidateNested()
  @Type(() => User)
  borrower: User;

  @ApiPropertyOptional({
    description: 'Created loan (if application was approved)',
    type: () => Loan,
  })
  @OneToOne(() => Loan, (loan) => loan.loanApplication, {
    nullable: true,
  })
  @JoinColumn({ name: 'loanId' })
  @ValidateNested()
  @Type(() => Loan)
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Reviewer/underwriter user',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewerId' })
  @ValidateNested()
  @Type(() => User)
  reviewer: User;

  @ApiPropertyOptional({
    description: 'Approver user',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  @ValidateNested()
  @Type(() => User)
  approver: User;

  @ApiPropertyOptional({
    description: 'Loan documents',
    type: () => [LoanDocument],
  })
  @OneToMany(() => LoanDocument, (document) => document.loanApplication, {
    cascade: true,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanDocument)
  documents: LoanDocument[];

  @ApiPropertyOptional({
    description: 'Loan collaterals',
    type: () => [LoanCollateral],
  })
  @OneToMany(() => LoanCollateral, (collateral) => collateral.loanApplication, {
    cascade: true,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanCollateral)
  collaterals: LoanCollateral[];

  @ApiPropertyOptional({
    description: 'Loan guarantors',
    type: () => [LoanGuarantor],
  })
  @OneToMany(() => LoanGuarantor, (guarantor) => guarantor.loanApplication, {
    cascade: true,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanGuarantor)
  guarantors: LoanGuarantor[];

  // Computed properties
  @ApiProperty({
    description: 'Debt-to-income ratio',
    example: 0.35,
    readOnly: true,
  })
  @Expose()
  get debtToIncomeRatio(): number {
    if (!this.monthlyIncome || this.monthlyIncome === 0) return 0;
    const totalMonthlyObligations = (this.monthlyDebt || 0) + (this.monthlyRepayment || 0);
    return totalMonthlyObligations / this.monthlyIncome;
  }

  @ApiProperty({
    description: 'Loan-to-income ratio',
    example: 10.0,
    readOnly: true,
  })
  @Expose()
  get loanToIncomeRatio(): number {
    if (!this.monthlyIncome || this.monthlyIncome === 0) return 0;
    const annualIncome = this.monthlyIncome * 12;
    return this.requestedAmount / annualIncome;
  }

  @ApiProperty({
    description: 'Whether debt-to-income ratio is acceptable (< 0.43)',
    example: true,
    readOnly: true,
  })
  @Expose()
  get hasAcceptableDti(): boolean {
    return this.debtToIncomeRatio <= 0.43;
  }

  @ApiProperty({
    description: 'Net monthly cash flow',
    example: 2000.0,
    readOnly: true,
  })
  @Expose()
  get netMonthlyCashFlow(): number {
    const totalIncome = this.monthlyIncome + (this.otherMonthlyIncome || 0);
    const totalExpenses = this.monthlyExpenses + (this.monthlyDebt || 0) + (this.monthlyRepayment || 0);
    return totalIncome - totalExpenses;
  }

  @ApiProperty({
    description: 'Loan amount per month of income',
    example: 4.17,
    readOnly: true,
  })
  @Expose()
  get loanPerIncomeMonth(): number {
    if (!this.monthlyIncome || this.monthlyIncome === 0) return 0;
    return this.requestedAmount / this.monthlyIncome;
  }

  @ApiProperty({
    description: 'Whether application is in draft status',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isDraft(): boolean {
    return this.status === LoanApplicationStatus.DRAFT;
  }

  @ApiProperty({
    description: 'Whether application is pending',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isPending(): boolean {
    return [
      LoanApplicationStatus.SUBMITTED,
      LoanApplicationStatus.UNDER_REVIEW,
      LoanApplicationStatus.PENDING_DOCUMENTS,
      LoanApplicationStatus.PENDING_APPROVAL,
      LoanApplicationStatus.PENDING_DISBURSEMENT,
    ].includes(this.status);
  }

  @ApiProperty({
    description: 'Whether application is approved',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isApproved(): boolean {
    return this.status === LoanApplicationStatus.APPROVED;
  }

  @ApiProperty({
    description: 'Whether application is rejected',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isRejected(): boolean {
    return this.status === LoanApplicationStatus.REJECTED;
  }

  @ApiProperty({
    description: 'Whether application is disbursed',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isDisbursed(): boolean {
    return this.status === LoanApplicationStatus.DISBURSED;
  }

  @ApiProperty({
    description: 'Whether application is expired',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isExpired(): boolean {
    return this.status === LoanApplicationStatus.EXPIRED;
  }

  @ApiProperty({
    description: 'Whether application is cancelled',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isCancelled(): boolean {
    return this.status === LoanApplicationStatus.CANCELLED;
  }

  @ApiProperty({
    description: 'Application age in days',
    example: 5,
    readOnly: true,
  })
  @Expose()
  get ageInDays(): number {
    if (!this.createdAt) return 0;
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Days since submission',
    example: 3,
    readOnly: true,
  })
  @Expose()
  get daysSinceSubmission(): number | null {
    if (!this.submittedAt) return null;
    const now = new Date();
    const submitted = new Date(this.submittedAt);
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Total fees amount',
    example: 850.0,
    readOnly: true,
  })
  @Expose()
  get totalFees(): number {
    return (this.platformFee || 0) + (this.insuranceFee || 0) + (this.otherFees || 0);
  }

  @ApiProperty({
    description: 'Fees as percentage of loan amount',
    example: 1.7,
    readOnly: true,
  })
  @Expose()
  get feesPercentage(): number {
    if (!this.requestedAmount || this.requestedAmount === 0) return 0;
    return (this.totalFees / this.requestedAmount) * 100;
  }

  @ApiProperty({
    description: 'Effective interest rate (including fees)',
    example: 15.8,
    readOnly: true,
  })
  @Expose()
  get effectiveInterestRate(): number {
    if (!this.approvedInterestRate) return this.approvedInterestRate || 0;
    const feesAsInterest = (this.totalFees / this.requestedAmount) * 100;
    return this.approvedInterestRate + feesAsInterest;
  }

  // Lifecycle hooks
  @BeforeInsert()
  async beforeInsert() {
    if (!this.applicationNumber) {
      this.applicationNumber = this.generateApplicationNumber();
    }
    
    // Set expiry date (30 days from creation if not submitted)
    if (!this.expiresAt && !this.isSubmitted) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      this.expiresAt = expiryDate;
    }

    // Calculate credit score if not provided
    if (!this.creditScore) {
      this.creditScore = await this.calculateEstimatedCreditScore();
    }
  }

  @BeforeUpdate()
  async beforeUpdate() {
    // Update version for optimistic locking
    this.version += 1;

    // Handle status transitions
    this.handleStatusTransitions();
  }

  @AfterInsert()
  async afterInsert() {
    console.log(`Loan application created: ${this.applicationNumber} (${this.id})`);
    // Emit event: loan.application.created
  }

  @AfterUpdate()
  async afterUpdate() {
    console.log(`Loan application updated: ${this.applicationNumber} (${this.id})`);
    // Emit event: loan.application.updated
  }

  // Business logic methods
  private generateApplicationNumber(): string {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `APP-${new Date().getFullYear()}-${timestamp}${random}`;
  }

  private async calculateEstimatedCreditScore(): Promise<number> {
    // Simplified credit score estimation
    let score = 650; // Base score
    
    // Adjust based on employment
    if (this.employmentStatus === EmploymentStatus.EMPLOYED) {
      score += 20;
    } else if (this.employmentStatus === EmploymentStatus.SELF_EMPLOYED) {
      score += 10;
    } else if (this.employmentStatus === EmploymentStatus.UNEMPLOYED) {
      score -= 30;
    }

    // Adjust based on employment duration
    if (this.employmentDurationMonths && this.employmentDurationMonths > 24) {
      score += 15;
    } else if (this.employmentDurationMonths && this.employmentDurationMonths > 12) {
      score += 5;
    }

    // Adjust based on debt-to-income ratio
    if (this.debtToIncomeRatio < 0.3) {
      score += 25;
    } else if (this.debtToIncomeRatio < 0.4) {
      score += 10;
    } else if (this.debtToIncomeRatio > 0.5) {
      score -= 20;
    }

    // Ensure score stays within bounds
    return Math.max(300, Math.min(850, score));
  }

  private handleStatusTransitions(): void {
    const now = new Date();

    // Handle submission
    if (this.isSubmitted && !this.submittedAt) {
      this.submittedAt = now;
      // Extend expiry to 90 days from submission
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 90);
      this.expiresAt = newExpiry;
    }

    // Handle approval
    if (this.isApproved && !this.approvedAt) {
      this.approvedAt = now;
    }

    // Handle rejection
    if (this.isRejected && !this.rejectedAt) {
      this.rejectedAt = now;
    }

    // Handle cancellation
    if (this.isCancelled && !this.cancelledAt) {
      this.cancelledAt = now;
    }

    // Handle disbursement
    if (this.isDisbursed && !this.disbursedAt) {
      this.disbursedAt = now;
    }

    // Check for expiry
    if (this.expiresAt && now > this.expiresAt && this.status !== LoanApplicationStatus.EXPIRED) {
      this.status = LoanApplicationStatus.EXPIRED;
    }
  }

  submit(): void {
    if (this.isSubmitted) {
      throw new Error('Application already submitted');
    }

    // Validate required fields before submission
    this.validateForSubmission();

    this.isSubmitted = true;
    this.status = LoanApplicationStatus.SUBMITTED;
    this.submittedAt = new Date();
  }

  private validateForSubmission(): void {
    const requiredFields = [
      'loanPurpose',
      'requestedAmount',
      'requestedTermMonths',
      'monthlyIncome',
      'employmentStatus',
      'incomeFrequency',
      'monthlyExpenses',
    ];

    const missingFields = requiredFields.filter(field => !this[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate amount
    if (this.requestedAmount <= 0) {
      throw new Error('Loan amount must be greater than zero');
    }

    // Validate term
    if (this.requestedTermMonths <= 0) {
      throw new Error('Loan term must be greater than zero');
    }

    // Validate income
    if (this.monthlyIncome <= 0) {
      throw new Error('Monthly income must be greater than zero');
    }
  }

  approve(
    approvedAmount: number,
    approvedInterestRate: number,
    approvedTermMonths: number,
    approverId: string,
  ): void {
    if (this.isApproved) {
      throw new Error('Application already approved');
    }

    if (this.isRejected) {
      throw new Error('Cannot approve a rejected application');
    }

    if (this.isCancelled) {
      throw new Error('Cannot approve a cancelled application');
    }

    // Validate approval parameters
    if (approvedAmount <= 0) {
      throw new Error('Approved amount must be greater than zero');
    }

    if (approvedAmount > this.requestedAmount) {
      throw new Error('Approved amount cannot exceed requested amount');
    }

    if (approvedInterestRate < 0) {
      throw new Error('Interest rate cannot be negative');
    }

    if (approvedTermMonths <= 0) {
      throw new Error('Loan term must be greater than zero');
    }

    this.approvedAmount = approvedAmount;
    this.approvedInterestRate = approvedInterestRate;
    this.approvedTermMonths = approvedTermMonths;
    this.approverId = approverId;
    this.status = LoanApplicationStatus.APPROVED;
    this.approvedAt = new Date();

    // Calculate repayment amounts
    this.calculateRepaymentAmounts();
  }

  private calculateRepaymentAmounts(): void {
    if (!this.approvedAmount || !this.approvedInterestRate || !this.approvedTermMonths) {
      return;
    }

    // Simple interest calculation
    const principal = this.approvedAmount;
    const annualInterestRate = this.approvedInterestRate / 100;
    const termYears = this.approvedTermMonths / 12;

    // Total interest
    this.totalInterestAmount = principal * annualInterestRate * termYears;

    // Total repayment
    this.totalRepaymentAmount = principal + this.totalInterestAmount;

    // Monthly repayment
    this.monthlyRepayment = this.totalRepaymentAmount / this.approvedTermMonths;

    // Calculate APR (simplified)
    this.apr = this.approvedInterestRate + (this.feesPercentage || 0);

    // Calculate disbursement amount (after fees)
    this.disbursementAmount = this.approvedAmount - this.totalFees;
  }

  reject(reason: string, reviewerId?: string): void {
    if (this.isApproved) {
      throw new Error('Cannot reject an approved application');
    }

    if (this.isRejected) {
      throw new Error('Application already rejected');
    }

    if (this.isCancelled) {
      throw new Error('Cannot reject a cancelled application');
    }

    this.rejectionReason = reason;
    this.reviewerId = reviewerId || this.reviewerId;
    this.status = LoanApplicationStatus.REJECTED;
    this.rejectedAt = new Date();
  }

  cancel(reason: string): void {
    if (this.isApproved) {
      throw new Error('Cannot cancel an approved application');
    }

    if (this.isRejected) {
      throw new Error('Cannot cancel a rejected application');
    }

    if (this.isDisbursed) {
      throw new Error('Cannot cancel a disbursed application');
    }

    this.cancellationReason = reason;
    this.status = LoanApplicationStatus.CANCELLED;
    this.cancelledAt = new Date();
  }

  startReview(reviewerId: string): void {
    if (!this.isSubmitted) {
      throw new Error('Cannot review a non-submitted application');
    }

    if (this.isApproved || this.isRejected || this.isDisbursed) {
      throw new Error('Cannot review a finalized application');
    }

    this.reviewerId = reviewerId;
    this.status = LoanApplicationStatus.UNDER_REVIEW;
    this.reviewStartDate = new Date();
  }

  completeReview(): void {
    if (this.status !== LoanApplicationStatus.UNDER_REVIEW) {
      throw new Error('Application is not under review');
    }

    this.reviewEndDate = new Date();
  }

  requestDocuments(): void {
    this.status = LoanApplicationStatus.PENDING_DOCUMENTS;
  }

  markDocumentsComplete(): void {
    if (this.status === LoanApplicationStatus.PENDING_DOCUMENTS) {
      this.status = LoanApplicationStatus.PENDING_APPROVAL;
    }
  }

  disburse(loanId: string): void {
    if (!this.isApproved) {
      throw new Error('Cannot disburse a non-approved application');
    }

    this.loanId = loanId;
    this.status = LoanApplicationStatus.DISBURSED;
    this.disbursedAt = new Date();
  }

  // Utility methods
  toJSON(): any {
    const obj = { ...this };
    // Remove sensitive/internal fields
    delete obj.internalNotes;
    delete obj.reviewerId;
    delete obj.approverId;
    delete obj.deletedAt;
    delete obj.version;
    delete obj.metadata;
    return obj;
  }

  toString(): string {
    return `LoanApplication#${this.applicationNumber} (${this.status})`;
  }

  getSummary(): {
    amount: number;
    term: number;
    purpose: string;
    status: string;
    createdAt: Date;
  } {
    return {
      amount: this.requestedAmount,
      term: this.requestedTermMonths,
      purpose: this.loanPurpose,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  isEligibleForFastTrack(): boolean {
    return (
      this.creditScore >= 700 &&
      this.debtToIncomeRatio <= 0.35 &&
      this.employmentStatus === EmploymentStatus.EMPLOYED &&
      this.employmentDurationMonths >= 24 &&
      !this.hasRecentDelinquencies()
    );
  }

  private hasRecentDelinquencies(): boolean {
    // Check credit report for recent delinquencies
    if (this.creditReport?.delinquencies) {
      const recentDelinquencies = this.creditReport.delinquencies.filter(
        (d: any) => {
          const delinquencyDate = new Date(d.date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return delinquencyDate > sixMonthsAgo;
        }
      );
      return recentDelinquencies.length > 0;
    }
    return false;
  }

  getRequiredDocuments(): string[] {
    const baseDocuments = [
      'identity_proof',
      'address_proof',
      'income_proof',
    ];

    if (this.loanPurpose === LoanPurpose.BUSINESS) {
      baseDocuments.push('business_registration', 'bank_statements_6months');
    }

    if (this.requestedAmount > 10000) {
      baseDocuments.push('tax_returns_2years');
    }

    if (this.collaterals && this.collaterals.length > 0) {
      baseDocuments.push('collateral_documents');
    }

    return baseDocuments;
  }
}