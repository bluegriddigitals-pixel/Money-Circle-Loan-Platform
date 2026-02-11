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
  OneToMany,
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
  IsUUID,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsPositive,
  Min,
  Max,
  IsInt,
  ValidateNested,
  IsObject,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanDocument } from './loan-document.entity';
import { User } from '../../user/entities/user.entity';

export enum GuarantorStatus {
  PENDING = 'pending',
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  RELEASED = 'released',
  TERMINATED = 'terminated',
}

export enum GuarantorType {
  PERSONAL = 'personal',
  CORPORATE = 'corporate',
  INSTITUTIONAL = 'institutional',
}

export enum RelationshipType {
  FAMILY_MEMBER = 'family_member',
  FRIEND = 'friend',
  BUSINESS_PARTNER = 'business_partner',
  EMPLOYER = 'employer',
  COLLEAGUE = 'colleague',
  OTHER = 'other',
}

export enum GuaranteeType {
  FULL = 'full',
  PARTIAL = 'partial',
  JOINT = 'joint',
  SEVERAL = 'several',
}

@Entity('loan_guarantors')
@Index(['loanId'])
@Index(['loanApplicationId'])
@Index(['userId'], { unique: true, where: 'user_id IS NOT NULL' })
@Index(['email'])
@Index(['phoneNumber'])
@Index(['status'])
@Index(['createdAt'])
export class LoanGuarantor {
  @ApiProperty({
    description: 'Unique identifier for the guarantor',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique guarantor reference number',
    example: 'GUA-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  guarantorNumber: string;

  @ApiPropertyOptional({
    description: 'ID of the loan (if associated with a loan)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanId: string;

  @ApiPropertyOptional({
    description: 'ID of the loan application (if associated with an application)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanApplicationId: string;

  @ApiPropertyOptional({
    description: 'ID of the user (if guarantor is a registered user)',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Guarantor type',
    enum: GuarantorType,
    example: GuarantorType.PERSONAL,
    default: GuarantorType.PERSONAL,
  })
  @Column({
    type: 'enum',
    enum: GuarantorType,
    default: GuarantorType.PERSONAL,
    nullable: false,
  })
  @IsEnum(GuarantorType)
  guarantorType: GuarantorType;

  @ApiProperty({
    description: 'First name',
    example: 'Jane',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Smith',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Marie',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jane.smith@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 20, nullable: false })
  @IsPhoneNumber()
  @Transform(({ value }) => value?.replace(/\s/g, '').replace(/^0/, '+'))
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Alternate phone number',
    example: '+0987654321',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  alternatePhoneNumber: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1985-05-15',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: 'A123456789',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId: string;

  @ApiPropertyOptional({
    description: 'Passport number',
    example: 'P12345678',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  passportNumber: string;

  @ApiPropertyOptional({
    description: 'Tax ID number',
    example: 'T123456789',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId: string;

  @ApiProperty({
    description: 'Relationship to borrower',
    enum: RelationshipType,
    example: RelationshipType.FAMILY_MEMBER,
  })
  @Column({
    type: 'enum',
    enum: RelationshipType,
    nullable: false,
  })
  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  @ApiPropertyOptional({
    description: 'Detailed relationship description',
    example: 'Sister of the borrower',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  relationshipDescription: string;

  @ApiPropertyOptional({
    description: 'Years known',
    example: 10,
    minimum: 0,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsKnown: number;

  @ApiProperty({
    description: 'Occupation',
    example: 'Software Engineer',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  occupation: string;

  @ApiPropertyOptional({
    description: 'Company/employer name',
    example: 'Tech Solutions Inc.',
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  employer: string;

  @ApiPropertyOptional({
    description: 'Job title/position',
    example: 'Senior Developer',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle: string;

  @ApiPropertyOptional({
    description: 'Employment duration in months',
    example: 60,
    minimum: 0,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  employmentDurationMonths: number;

  @ApiProperty({
    description: 'Annual income',
    example: 75000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  annualIncome: number;

  @ApiPropertyOptional({
    description: 'Additional annual income sources',
    example: 15000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalAnnualIncome: number;

  @ApiPropertyOptional({
    description: 'Total assets value',
    example: 300000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAssets: number;

  @ApiPropertyOptional({
    description: 'Total liabilities',
    example: 100000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLiabilities: number;

  @ApiPropertyOptional({
    description: 'Net worth (assets - liabilities)',
    example: 200000.0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  netWorth: number;

  @ApiPropertyOptional({
    description: 'Monthly expenses',
    example: 3000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses: number;

  @ApiPropertyOptional({
    description: 'Monthly debt obligations',
    example: 1000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyDebt: number;

  @ApiPropertyOptional({
    description: 'Credit score',
    example: 750,
    minimum: 300,
    maximum: 850,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiPropertyOptional({
    description: 'Credit bureau report data',
    example: {
      bureau: 'Equifax',
      reportDate: '2024-01-15',
      scoreFactors: ['payment_history', 'credit_utilization'],
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  creditReport: Record<string, any>;

  @ApiProperty({
    description: 'Guarantee type',
    enum: GuaranteeType,
    example: GuaranteeType.FULL,
    default: GuaranteeType.FULL,
  })
  @Column({
    type: 'enum',
    enum: GuaranteeType,
    default: GuaranteeType.FULL,
    nullable: false,
  })
  @IsEnum(GuaranteeType)
  guaranteeType: GuaranteeType;

  @ApiPropertyOptional({
    description: 'Guarantee amount (for partial guarantee)',
    example: 25000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  guaranteeAmount: number;

  @ApiPropertyOptional({
    description: 'Guarantee percentage (for partial guarantee)',
    example: 50.0,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  guaranteePercentage: number;

  @ApiPropertyOptional({
    description: 'Maximum liability amount',
    example: 50000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLiability: number;

  @ApiPropertyOptional({
    description: 'Collateral provided by guarantor',
    example: [
      { type: 'savings_account', value: 20000, description: 'Bank savings' },
    ],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  providedCollateral: Array<{
    type: string;
    value: number;
    description: string;
  }>;

  @ApiProperty({
    description: 'Guarantor status',
    enum: GuarantorStatus,
    example: GuarantorStatus.PENDING,
    default: GuarantorStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: GuarantorStatus,
    default: GuarantorStatus.PENDING,
    nullable: false,
  })
  @IsEnum(GuarantorStatus)
  status: GuarantorStatus;

  @ApiPropertyOptional({
    description: 'Invitation date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invitedAt: Date;

  @ApiPropertyOptional({
    description: 'Invitation token',
    example: 'invite_token_123456',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  invitationToken: string;

  @ApiPropertyOptional({
    description: 'Invitation expiry date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invitationExpiry: Date;

  @ApiPropertyOptional({
    description: 'Acceptance date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  acceptedAt: Date;

  @ApiPropertyOptional({
    description: 'Declined date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  declinedAt: Date;

  @ApiPropertyOptional({
    description: 'Decline reason',
    example: 'Not comfortable with the risk',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  declineReason: string;

  @ApiPropertyOptional({
    description: 'Verification date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  verifiedAt: Date;

  @ApiPropertyOptional({
    description: 'Verification method',
    example: 'document_verification',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  verificationMethod: string;

  @ApiPropertyOptional({
    description: 'Verification notes',
    example: 'Documents verified and credit check completed',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  verificationNotes: string;

  @ApiPropertyOptional({
    description: 'Activation date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  activatedAt: Date;

  @ApiPropertyOptional({
    description: 'Release date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releasedAt: Date;

  @ApiPropertyOptional({
    description: 'Release reason',
    example: 'Loan fully repaid',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  releaseReason: string;

  @ApiPropertyOptional({
    description: 'Termination date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  terminatedAt: Date;

  @ApiPropertyOptional({
    description: 'Termination reason',
    example: 'Guarantor requested removal',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  terminationReason: string;

  @ApiPropertyOptional({
    description: 'Guarantor agreement signed date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  agreementSignedAt: Date;

  @ApiPropertyOptional({
    description: 'Guarantor agreement document storage path',
    example: 'https://s3.amazonaws.com/bucket/documents/guarantor_agreement.pdf',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  agreementDocumentPath: string;

  @ApiPropertyOptional({
    description: 'Address information',
    example: {
      street: '456 Oak Avenue',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
      postalCode: '12345',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    example: {
      name: 'John Smith',
      relationship: 'Spouse',
      phone: '+1122334455',
      email: 'john.smith@example.com',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };

  @ApiPropertyOptional({
    description: 'Bank account information (for repayments)',
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
  bankAccount: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    iban?: string;
    swiftCode?: string;
    accountType: string;
  };

  @ApiPropertyOptional({
    description: 'Risk assessment score (0-100)',
    example: 80.5,
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
    description: 'Risk factors',
    example: ['high_debt_to_income', 'recent_credit_inquiry'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  riskFactors: string[];

  @ApiPropertyOptional({
    description: 'Notes/comments',
    example: 'Guarantor has stable employment and good credit history',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Requires additional income verification',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['primary', 'verified', 'high_income'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Communication preferences',
    example: {
      email: true,
      sms: true,
      phone: false,
      mail: false,
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  communicationPreferences: Record<string, boolean>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Guarantor creation timestamp',
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
    description: 'Loan associated with this guarantor',
    type: () => Loan,
  })
  @ManyToOne(() => Loan, (loan) => loan.guarantors, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Loan application associated with this guarantor',
    type: () => LoanApplication,
  })
  @ManyToOne(() => LoanApplication, (loanApplication) => loanApplication.guarantors, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loan_application_id' })
  loanApplication: LoanApplication;

  @ApiPropertyOptional({
    description: 'User account associated with this guarantor',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.guarantors, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional({
    description: 'Documents uploaded for this guarantor',
    type: () => [LoanDocument],
  })
  @OneToMany(() => LoanDocument, (document) => document.guarantor)
  documents: LoanDocument[];

  // Virtual/computed properties
  @ApiProperty({
    description: 'Full name of guarantor',
    example: 'Jane Marie Smith',
    readOnly: true,
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName}${this.middleName ? ` ${this.middleName}` : ''} ${this.lastName}`;
  }

  @ApiProperty({
    description: 'Age of guarantor',
    example: 38,
    readOnly: true,
  })
  @Expose()
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  @ApiProperty({
    description: 'Total annual income including additional income',
    example: 90000.0,
    readOnly: true,
  })
  @Expose()
  get totalAnnualIncome(): number {
    return this.annualIncome + (this.additionalAnnualIncome || 0);
  }

  @ApiProperty({
    description: 'Debt-to-income ratio',
    example: 0.2,
    readOnly: true,
  })
  @Expose()
  get debtToIncomeRatio(): number | null {
    if (!this.monthlyDebt || this.totalAnnualIncome <= 0) return null;
    const annualDebt = this.monthlyDebt * 12;
    return annualDebt / this.totalAnnualIncome;
  }

  @ApiProperty({
    description: 'Is guarantor currently active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.status === GuarantorStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Is guarantor invitation expired',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isInvitationExpired(): boolean {
    if (!this.invitationExpiry) return false;
    return new Date() > this.invitationExpiry;
  }

  @ApiProperty({
    description: 'Can guarantor be invited',
    example: true,
    readOnly: true,
  })
  @Expose()
  get canBeInvited(): boolean {
    return !this.invitationToken || this.isInvitationExpired;
  }

  @ApiProperty({
    description: 'Has guarantor accepted the invitation',
    example: false,
    readOnly: true,
  })
  @Expose()
  get hasAccepted(): boolean {
    return !!this.acceptedAt && this.status === GuarantorStatus.ACCEPTED;
  }

  // Lifecycle hooks
  @BeforeInsert()
  generateGuarantorNumber() {
    if (!this.guarantorNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.guarantorNumber = `GUA-${year}-${random}`;
    }
    this.email = this.email.toLowerCase().trim();
    this.phoneNumber = this.phoneNumber.replace(/\s/g, '').replace(/^0/, '+');
    if (this.alternatePhoneNumber) {
      this.alternatePhoneNumber = this.alternatePhoneNumber.replace(/\s/g, '').replace(/^0/, '+');
    }
  }

  @BeforeUpdate()
  updateCalculatedFields() {
    // Calculate net worth if assets or liabilities are provided
    if (this.totalAssets !== undefined || this.totalLiabilities !== undefined) {
      const assets = this.totalAssets || 0;
      const liabilities = this.totalLiabilities || 0;
      this.netWorth = assets - liabilities;
    }

    // Update version for optimistic locking
    this.version += 1;

    // Update timestamps based on status changes
    if (this.status === GuarantorStatus.ACTIVE && !this.activatedAt) {
      this.activatedAt = new Date();
    }
  }

  // Business logic methods
  invite(invitationToken: string, expiryHours: number = 72): void {
    if (this.status !== GuarantorStatus.PENDING) {
      throw new Error(`Cannot invite guarantor with status: ${this.status}`);
    }

    this.invitationToken = invitationToken;
    this.invitationExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    this.invitedAt = new Date();
    this.status = GuarantorStatus.INVITED;
  }

  accept(): void {
    if (this.status !== GuarantorStatus.INVITED) {
      throw new Error(`Cannot accept guarantor with status: ${this.status}`);
    }

    if (this.isInvitationExpired) {
      throw new Error('Invitation has expired');
    }

    this.acceptedAt = new Date();
    this.status = GuarantorStatus.ACCEPTED;
    this.invitationToken = null;
  }

  decline(reason: string): void {
    if (this.status !== GuarantorStatus.INVITED) {
      throw new Error(`Cannot decline guarantor with status: ${this.status}`);
    }

    this.declinedAt = new Date();
    this.declineReason = reason;
    this.status = GuarantorStatus.DECLINED;
    this.invitationToken = null;
  }

  verify(method: string, notes?: string): void {
    if (this.status !== GuarantorStatus.ACCEPTED) {
      throw new Error(`Cannot verify guarantor with status: ${this.status}`);
    }

    this.verifiedAt = new Date();
    this.verificationMethod = method;
    this.verificationNotes = notes;
    this.status = GuarantorStatus.VERIFIED;
  }

  activate(): void {
    if (this.status !== GuarantorStatus.VERIFIED) {
      throw new Error(`Cannot activate guarantor with status: ${this.status}`);
    }

    this.activatedAt = new Date();
    this.status = GuarantorStatus.ACTIVE;
  }

  release(reason: string): void {
    if (this.status !== GuarantorStatus.ACTIVE) {
      throw new Error(`Cannot release guarantor with status: ${this.status}`);
    }

    this.releasedAt = new Date();
    this.releaseReason = reason;
    this.status = GuarantorStatus.RELEASED;
  }

  terminate(reason: string): void {
    this.terminatedAt = new Date();
    this.terminationReason = reason;
    this.status = GuarantorStatus.TERMINATED;
  }

  signAgreement(documentPath: string): void {
    this.agreementSignedAt = new Date();
    this.agreementDocumentPath = documentPath;
  }

  // Validation methods
  @Expose()
  get isValid(): boolean {
    return (
      this.firstName &&
      this.lastName &&
      this.email &&
      this.phoneNumber &&
      this.occupation &&
      this.annualIncome > 0
    );
  }

  @Expose()
  get isEligible(): boolean {
    const minAge = 18;
    const maxAge = 65;
    const minIncome = 20000;
    const minCreditScore = 600;

    if (this.age && (this.age < minAge || this.age > maxAge)) return false;
    if (this.totalAnnualIncome < minIncome) return false;
    if (this.creditScore && this.creditScore < minCreditScore) return false;
    if (this.debtToIncomeRatio && this.debtToIncomeRatio > 0.5) return false;

    return true;
  }

  @Expose()
  get riskLevel(): 'low' | 'medium' | 'high' {
    if (!this.riskScore) {
      if (this.creditScore && this.creditScore >= 750) return 'low';
      if (this.creditScore && this.creditScore >= 650) return 'medium';
      return 'high';
    }

    if (this.riskScore >= 80) return 'low';
    if (this.riskScore >= 60) return 'medium';
    return 'high';
  }

  // Static methods
  static createPersonalGuarantor(data: Partial<LoanGuarantor>): LoanGuarantor {
    const guarantor = new LoanGuarantor();
    Object.assign(guarantor, data);
    guarantor.guarantorType = GuarantorType.PERSONAL;
    return guarantor;
  }

  static createCorporateGuarantor(data: Partial<LoanGuarantor>): LoanGuarantor {
    const guarantor = new LoanGuarantor();
    Object.assign(guarantor, data);
    guarantor.guarantorType = GuarantorType.CORPORATE;
    return guarantor;
  }

  // Helper methods
  updateFinancialInfo(financialData: {
    annualIncome?: number;
    additionalAnnualIncome?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    monthlyExpenses?: number;
    monthlyDebt?: number;
    creditScore?: number;
  }): void {
    Object.assign(this, financialData);
    this.updateCalculatedFields();
  }

  addCollateral(collateral: { type: string; value: number; description: string }): void {
    if (!this.providedCollateral) {
      this.providedCollateral = [];
    }
    this.providedCollateral.push(collateral);
  }

  removeCollateral(index: number): void {
    if (this.providedCollateral && index >= 0 && index < this.providedCollateral.length) {
      this.providedCollateral.splice(index, 1);
    }
  }

  addRiskFactor(factor: string): void {
    if (!this.riskFactors) {
      this.riskFactors = [];
    }
    if (!this.riskFactors.includes(factor)) {
      this.riskFactors.push(factor);
    }
  }

  removeRiskFactor(factor: string): void {
    if (this.riskFactors) {
      const index = this.riskFactors.indexOf(factor);
      if (index > -1) {
        this.riskFactors.splice(index, 1);
      }
    }
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
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

  // JSON serialization
  toJSON(): any {
    return {
      id: this.id,
      guarantorNumber: this.guarantorNumber,
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      status: this.status,
      guarantorType: this.guarantorType,
      relationship: this.relationship,
      occupation: this.occupation,
      annualIncome: this.annualIncome,
      totalAnnualIncome: this.totalAnnualIncome,
      creditScore: this.creditScore,
      guaranteeType: this.guaranteeType,
      guaranteeAmount: this.guaranteeAmount,
      guaranteePercentage: this.guaranteePercentage,
      riskLevel: this.riskLevel,
      isActive: this.isActive,
      isValid: this.isValid,
      isEligible: this.isEligible,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}