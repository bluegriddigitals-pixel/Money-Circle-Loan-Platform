import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
} from 'typeorm';
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsOptional,
  IsDate,
  IsPhoneNumber,
  Matches,
  MinLength,
  MaxLength,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  ValidateNested,
  IsUUID,
} from 'class-validator';

import { UserProfile } from './user-profile.entity';
import { LoanApplication } from '../../loan/entities/loan-application.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { LoanGuarantor } from '../../loan/entities/loan-guarantor.entity';
import { PaymentMethod } from '../../payment/entities/payment-method.entity';
import { PayoutRequest } from '../../payment/entities/payout-request.entity';
import { Investment } from '../../marketplace/entities/investment.entity';

export enum UserRole {
  BORROWER = 'borrower',
  LENDER = 'lender',
  AUDITOR = 'auditor',
  TRANSACTION_ADMIN = 'transaction_admin',
  SYSTEM_ADMIN = 'system_admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  RISK_ANALYST = 'risk_analyst',
  CUSTOMER_SUPPORT = 'customer_support',
  FINANCIAL_ADVISOR = 'financial_advisor',
  LEGAL_ADVISOR = 'legal_advisor',
  PARTNER = 'partner',
  AFFILIATE = 'affiliate',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
  FROZEN = 'frozen',
  RESTRICTED = 'restricted',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  UNDER_REVIEW = 'under_review',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  FULLY_VERIFIED = 'fully_verified',
}

export enum LoginMethod {
  EMAIL_PASSWORD = 'email_password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  PHONE_OTP = 'phone_otp',
  BIOMETRIC = 'biometric',
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity('users')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['phoneNumber'], { unique: true, where: 'phone_number IS NOT NULL AND deleted_at IS NULL' })
@Index(['accountStatus'])
@Index(['kycStatus'])
@Index(['verificationStatus'])
@Index(['role'])
@Index(['createdAt'])
@Index(['lastLoginAt'])
@Index(['referralCode'], { unique: true })
@Index(['externalId'], { unique: true, where: 'external_id IS NOT NULL' })
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'User email address (unique)',
    example: 'john.doe@example.com',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(255, { message: 'Email cannot be longer than 255 characters' })
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
    writeOnly: true,
    minLength: 8,
    example: 'StrongP@ssw0rd123',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude({ toPlainOnly: true })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  refreshTokenHash: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot be longer than 100 characters' })
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot be longer than 100 characters' })
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number with country code',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number with country code' })
  @Transform(({ value }) => value?.replace(/\s/g, '').replace(/^0/, '+'))
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'User date of birth',
    example: '1990-01-01',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.BORROWER,
    default: UserRole.BORROWER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BORROWER,
    nullable: false,
  })
  @IsEnum(UserRole, { message: 'Please provide a valid user role' })
  role: UserRole;

  @ApiProperty({
    description: 'Account status',
    enum: AccountStatus,
    example: AccountStatus.PENDING_VERIFICATION,
    default: AccountStatus.PENDING_VERIFICATION,
  })
  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING_VERIFICATION,
    nullable: false,
  })
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus;

  @ApiProperty({
    description: 'KYC verification status',
    enum: KycStatus,
    example: KycStatus.NOT_STARTED,
    default: KycStatus.NOT_STARTED,
  })
  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
    nullable: false,
  })
  @IsEnum(KycStatus)
  kycStatus: KycStatus;

  @ApiProperty({
    description: 'Verification status for email and phone',
    enum: VerificationStatus,
    example: VerificationStatus.UNVERIFIED,
    default: VerificationStatus.UNVERIFIED,
  })
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
    nullable: false,
  })
  @IsEnum(VerificationStatus)
  verificationStatus: VerificationStatus;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken: string;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationTokenExpiry: Date;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 6, nullable: true })
  @Exclude({ toPlainOnly: true })
  phoneVerificationCode: string;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  phoneVerificationCodeExpiry: Date;

  @ApiHideProperty()
  @Column({ type: 'text', nullable: true })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret: string;

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isTwoFactorEnabled: boolean;

  @ApiHideProperty()
  @Column({ type: 'jsonb', nullable: true })
  @Exclude({ toPlainOnly: true })
  backupCodes: string[];

  @ApiPropertyOptional({
    description: 'Last login timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginAt: Date;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivityAt: Date;

  @ApiPropertyOptional({
    description: 'Last password change timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastPasswordChangeAt: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
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
    description: 'Account deactivation timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deactivatedAt: Date;

  @ApiPropertyOptional({
    description: 'Reason for account deactivation/suspension',
    example: 'Violation of terms of service',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Deactivation reason cannot exceed 1000 characters' })
  deactivationReason: string;

  @ApiPropertyOptional({
    description: 'IP address from registration',
    example: '192.168.1.1',
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  @IsOptional()
  @IsString()
  registrationIp: string;

  @ApiPropertyOptional({
    description: 'User agent from registration',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  registrationUserAgent: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  registrationDeviceFingerprint: string;

  @ApiPropertyOptional({
    description: 'Accepted terms and conditions version',
    example: '1.0.0',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  acceptedTermsVersion: string;

  @ApiPropertyOptional({
    description: 'Accepted privacy policy version',
    example: '1.0.0',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  acceptedPrivacyVersion: string;

  @ApiProperty({
    description: 'Marketing consent',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  marketingConsent: boolean;

  @ApiProperty({
    description: 'Data processing consent (GDPR)',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  dataProcessingConsent: boolean;

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'en',
    default: 'en',
  })
  @Column({ type: 'varchar', length: 10, default: 'en', nullable: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferredLanguage: string;

  @ApiPropertyOptional({
    description: 'Preferred currency',
    example: 'USD',
    default: 'USD',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  preferredCurrency: string;

  @ApiPropertyOptional({
    description: 'Time zone',
    example: 'America/New_York',
    default: 'UTC',
  })
  @Column({ type: 'varchar', length: 50, default: 'UTC', nullable: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'Profile image URL cannot exceed 2048 characters' })
  profileImage: string;

  @ApiPropertyOptional({
    description: 'Biography or description',
    example: 'Experienced investor with 10+ years in peer-to-peer lending',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Biography cannot exceed 5000 characters' })
  bio: string;

  @ApiPropertyOptional({
    description: 'Occupation',
    example: 'Software Engineer',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Tech Corp Inc.',
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  company: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://john.doe.example.com',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  website: string;

  @ApiPropertyOptional({
    description: 'Social media profiles',
    example: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      facebook: 'https://facebook.com/johndoe',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  socialMedia: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Address information',
    example: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
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

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetToken: string;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetTokenExpiry: Date;

  @ApiPropertyOptional({
    description: 'Failed login attempts count',
    example: 0,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsOptional()
  @IsNumber()
  failedLoginAttempts: number;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  accountLockedUntil: Date;

  @ApiHideProperty()
  @Column({ type: 'jsonb', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordHistory: string[];

  @ApiHideProperty()
  @Column({ type: 'jsonb', nullable: true })
  @Exclude({ toPlainOnly: true })
  securityQuestions: Array<{
    question: string;
    answer: string;
    createdAt: Date;
  }>;

  @ApiPropertyOptional({
    description: 'Last login IP address',
    example: '192.168.1.100',
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  @IsOptional()
  @IsString()
  lastLoginIp: string;

  @ApiPropertyOptional({
    description: 'Last login device fingerprint',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  lastLoginDevice: string;

  @ApiPropertyOptional({
    description: 'Last login method',
    enum: LoginMethod,
    example: LoginMethod.EMAIL_PASSWORD,
  })
  @Column({
    type: 'enum',
    enum: LoginMethod,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(LoginMethod)
  lastLoginMethod: LoginMethod;

  @ApiPropertyOptional({
    description: 'Subscription tier',
    enum: SubscriptionTier,
    example: SubscriptionTier.FREE,
    default: SubscriptionTier.FREE,
  })
  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
    nullable: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier: SubscriptionTier;

  @ApiPropertyOptional({
    description: 'Subscription expiry date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  subscriptionExpiry: Date;

  @ApiPropertyOptional({
    description: 'Referral code (unique)',
    example: 'JOHNDOE123',
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode: string;

  @ApiPropertyOptional({
    description: 'Referrer user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  referredBy: string;

  @ApiPropertyOptional({
    description: 'Total referral count',
    example: 5,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsOptional()
  @IsNumber()
  referralCount: number;

  @ApiPropertyOptional({
    description: 'Total referral earnings',
    example: 500.50,
    default: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  @IsOptional()
  @IsNumber()
  referralEarnings: number;

  @ApiPropertyOptional({
    description: 'External user ID (for third-party integrations)',
    example: 'ext_123456789',
  })
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalId: string;

  @ApiPropertyOptional({
    description: 'External provider (e.g., google, facebook)',
    example: 'google',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  externalProvider: string;

  @ApiPropertyOptional({
    description: 'Metadata for custom fields',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['vip', 'early-adopter', 'whale'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'User preferences',
    example: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  preferences: Record<string, any>;

  @ApiPropertyOptional({
    description: 'User profile information',
    type: () => UserProfile,
  })
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ValidateNested()
  @Type(() => UserProfile)
  profile: UserProfile;

  // ============ LOAN RELATIONS ============
  @ApiPropertyOptional({
    description: 'Loan applications submitted by the user',
    type: () => [LoanApplication],
  })
  @OneToMany(() => LoanApplication, (application) => application.user, {
    cascade: false,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanApplication)
  loanApplications: LoanApplication[];

  @ApiPropertyOptional({
    description: 'Loans borrowed by the user',
    type: () => [Loan],
  })
  @OneToMany(() => Loan, (loan) => loan.borrower, {
    cascade: false,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => Loan)
  loans: Loan[];

  @ApiPropertyOptional({
    description: 'Guarantor obligations for the user',
    type: () => [LoanGuarantor],
  })
  @OneToMany(() => LoanGuarantor, (guarantor) => guarantor.user, {
    cascade: false,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LoanGuarantor)
  guarantors: LoanGuarantor[];
  // ========================================

   // ============ PAYMENT RELATIONS ============
  @ApiPropertyOptional({
    description: 'Payment methods for the user',
    type: () => [PaymentMethod],
  })
  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => PaymentMethod)
  paymentMethods: PaymentMethod[];

  @ApiPropertyOptional({
    description: 'Payout requests from the user',
    type: () => [PayoutRequest],
  })
  @OneToMany(() => PayoutRequest, (payout) => payout.user, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => PayoutRequest)
  payoutRequests: PayoutRequest[];
  // ========================================

  // ============ MARKETPLACE RELATIONS ============
  @ApiPropertyOptional({
    description: 'Investments made by the user',
    type: () => [Investment],
  })
  @OneToMany(() => Investment, (investment) => investment.investor, {
    cascade: true,
    eager: false,
  })
  @ValidateNested({ each: true })
  @Type(() => Investment)
  investments: Investment[];
  // ========================================

  // Computed properties (virtual fields)
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    readOnly: true,
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ApiProperty({
    description: 'Initials of the user',
    example: 'JD',
    readOnly: true,
  })
  @Expose()
  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.accountStatus === AccountStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Whether KYC is verified',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isKycVerified(): boolean {
    return this.kycStatus === KycStatus.VERIFIED;
  }

  @ApiProperty({
    description: 'Whether email is verified',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isEmailVerified(): boolean {
    return this.verificationStatus === VerificationStatus.EMAIL_VERIFIED ||
           this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
  }

  @ApiProperty({
    description: 'Whether phone is verified',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isPhoneVerified(): boolean {
    return this.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
           this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
  }

  @ApiProperty({
    description: 'Whether user is fully verified',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isFullyVerified(): boolean {
    return this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
  }

  @ApiProperty({
    description: 'User age (calculated from date of birth)',
    example: 30,
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
    description: 'Whether user is of legal age',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isOfLegalAge(): boolean {
    return this.age !== null && this.age >= 18;
  }

  @ApiProperty({
    description: 'Account age in days',
    example: 30,
    readOnly: true,
  })
  @Expose()
  get accountAgeInDays(): number {
    if (!this.createdAt) return 0;
    
    const today = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Whether account is new (less than 30 days)',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isNewAccount(): boolean {
    return this.accountAgeInDays < 30;
  }

  @ApiProperty({
    description: 'Whether account is eligible for loan application',
    example: false,
    readOnly: true,
  })
  @Expose()
  get canApplyForLoan(): boolean {
    return (
      this.isActive &&
      this.isKycVerified &&
      this.isFullyVerified &&
      this.isOfLegalAge &&
      this.accountAgeInDays >= 7
    );
  }

  @ApiProperty({
    description: 'Whether user can invest',
    example: false,
    readOnly: true,
  })
  @Expose()
  get canInvest(): boolean {
    return (
      this.isActive &&
      this.isKycVerified &&
      this.isFullyVerified &&
      this.isOfLegalAge &&
      this.role === UserRole.LENDER
    );
  }

  @ApiProperty({
    description: 'Whether user is an admin',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isAdmin(): boolean {
    return [
      UserRole.SYSTEM_ADMIN,
      UserRole.TRANSACTION_ADMIN,
      UserRole.COMPLIANCE_OFFICER,
      UserRole.RISK_ANALYST,
      UserRole.AUDITOR,
    ].includes(this.role);
  }

  @ApiProperty({
    description: 'Whether user is staff',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isStaff(): boolean {
    return this.isAdmin || [
      UserRole.CUSTOMER_SUPPORT,
      UserRole.FINANCIAL_ADVISOR,
      UserRole.LEGAL_ADVISOR,
    ].includes(this.role);
  }

  @ApiProperty({
    description: 'Whether user has premium subscription',
    example: false,
    readOnly: true,
  })
  @Expose()
  get hasPremiumSubscription(): boolean {
    return [
      SubscriptionTier.PREMIUM,
      SubscriptionTier.ENTERPRISE,
    ].includes(this.subscriptionTier);
  }

  @ApiProperty({
    description: 'Whether subscription is active',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isSubscriptionActive(): boolean {
    if (!this.subscriptionExpiry) return false;
    return new Date() < this.subscriptionExpiry;
  }

  // Lifecycle hooks
  @BeforeInsert()
  async beforeInsert() {
    // Generate referral code if not provided
    if (!this.referralCode) {
      this.referralCode = this.generateReferralCode();
    }

    // Set default preferences
    if (!this.preferences) {
      this.preferences = {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: this.phoneNumber ? true : false,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
        },
      };
    }

    // Validate age on insert
    this.validateAge();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    // Validate age on update if dateOfBirth changed
    if (this.dateOfBirth) {
      this.validateAge();
    }
  }

  @AfterInsert()
  async afterInsert() {
    console.log(`User created: ${this.email} (${this.id})`);
    
    // Emit user created event
    // this.eventEmitter.emit('user.created', this);
  }

  @AfterUpdate()
  async afterUpdate() {
    console.log(`User updated: ${this.email} (${this.id})`);
    
    // Emit user updated event
    // this.eventEmitter.emit('user.updated', this);
  }

  @AfterRemove()
  async afterRemove() {
    console.log(`User removed: ${this.email} (${this.id})`);
    
    // Emit user deleted event
    // this.eventEmitter.emit('user.deleted', this);
  }

  // Business logic methods
  validateAge(): void {
    if (this.dateOfBirth && this.age !== null) {
      if (this.age < 18) {
        throw new Error('User must be at least 18 years old');
      }
      if (this.age > 120) {
        throw new Error('Invalid date of birth');
      }
    }
  }

  updateActivity(): void {
    this.lastActivityAt = new Date();
  }

  verifyEmail(): void {
    if (!this.isEmailVerified) {
      if (this.verificationStatus === VerificationStatus.PHONE_VERIFIED) {
        this.verificationStatus = VerificationStatus.FULLY_VERIFIED;
      } else {
        this.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
      }
      this.emailVerificationToken = null;
      this.emailVerificationTokenExpiry = null;
    }
  }

  verifyPhone(): void {
    if (!this.isPhoneVerified) {
      if (this.verificationStatus === VerificationStatus.EMAIL_VERIFIED) {
        this.verificationStatus = VerificationStatus.FULLY_VERIFIED;
      } else {
        this.verificationStatus = VerificationStatus.PHONE_VERIFIED;
      }
      this.phoneVerificationCode = null;
      this.phoneVerificationCodeExpiry = null;
    }
  }

  suspend(reason: string): void {
    this.accountStatus = AccountStatus.SUSPENDED;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  activate(): void {
    this.accountStatus = AccountStatus.ACTIVE;
    this.deactivationReason = null;
    this.deactivatedAt = null;
  }

  deactivate(reason: string): void {
    this.accountStatus = AccountStatus.DEACTIVATED;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  freeze(reason: string): void {
    this.accountStatus = AccountStatus.FROZEN;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  restrict(reason: string): void {
    this.accountStatus = AccountStatus.RESTRICTED;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  completeKyc(): void {
    this.kycStatus = KycStatus.VERIFIED;
  }

  rejectKyc(reason: string): void {
    this.kycStatus = KycStatus.REJECTED;
    this.deactivationReason = reason;
  }

  setKycInProgress(): void {
    this.kycStatus = KycStatus.IN_PROGRESS;
  }

  private generateReferralCode(): string {
    // Generate a unique referral code (8 characters alphanumeric)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Utility methods
  toJSON(): any {
    const obj = { ...this };
    // Remove sensitive fields
    delete obj.password;
    delete obj.refreshTokenHash;
    delete obj.twoFactorSecret;
    delete obj.backupCodes;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationTokenExpiry;
    delete obj.phoneVerificationCode;
    delete obj.phoneVerificationCodeExpiry;
    delete obj.passwordResetToken;
    delete obj.passwordResetTokenExpiry;
    delete obj.accountLockedUntil;
    delete obj.passwordHistory;
    delete obj.securityQuestions;
    delete obj.deletedAt;
    return obj;
  }

  toString(): string {
    return `User#${this.id} (${this.email})`;
  }
}