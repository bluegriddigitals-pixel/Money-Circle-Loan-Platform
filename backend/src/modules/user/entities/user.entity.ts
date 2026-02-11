import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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
import { Exclude, Transform, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsOptional, IsDate, IsPhoneNumber, Matches, MinLength, MaxLength } from 'class-validator';

import { UserProfile } from './user-profile.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { Transaction } from '../../payment/entities/transaction.entity';
import { Investment } from '../../marketplace/entities/investment.entity';
import { Kyc } from '../../compliance/entities/kyc.entity';

export enum UserRole {
  BORROWER = 'borrower',
  LENDER = 'lender',
  AUDITOR = 'auditor',
  TRANSACTION_ADMIN = 'transaction_admin',
  SYSTEM_ADMIN = 'system_admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  RISK_ANALYST = 'risk_analyst',
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  FULLY_VERIFIED = 'fully_verified',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phoneNumber'], { unique: true, where: 'phone_number IS NOT NULL' })
@Index(['accountStatus'])
@Index(['kycStatus'])
@Index(['role'])
@Index(['createdAt'])
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
    writeOnly: true,
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

  @ApiProperty({
    description: 'Refresh token hash for JWT refresh tokens',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  refreshTokenHash: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot be longer than 100 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot be longer than 100 characters' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number with country code',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'User date of birth',
    example: '1990-01-01',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.BORROWER,
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
    example: AccountStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING,
    nullable: false,
  })
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus;

  @ApiProperty({
    description: 'KYC verification status',
    enum: KycStatus,
    example: KycStatus.NOT_STARTED,
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
  })
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
    nullable: false,
  })
  @IsEnum(VerificationStatus)
  verificationStatus: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Email verification token',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken: string;

  @ApiPropertyOptional({
    description: 'Email verification token expiry',
  })
  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpiry: Date;

  @ApiPropertyOptional({
    description: 'Phone verification code',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 6, nullable: true })
  @Exclude({ toPlainOnly: true })
  phoneVerificationCode: string;

  @ApiPropertyOptional({
    description: 'Phone verification code expiry',
  })
  @Column({ type: 'timestamp', nullable: true })
  phoneVerificationCodeExpiry: Date;

  @ApiPropertyOptional({
    description: 'Two-factor authentication secret',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret: string;

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled',
    example: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  isTwoFactorEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @ApiPropertyOptional({
    description: 'Last password change timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChangeAt: Date;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Account deactivation timestamp',
  })
  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @ApiPropertyOptional({
    description: 'Reason for account deactivation',
  })
  @Column({ type: 'text', nullable: true })
  deactivationReason: string;

  @ApiPropertyOptional({
    description: 'IP address from registration',
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  registrationIp: string;

  @ApiPropertyOptional({
    description: 'User agent from registration',
  })
  @Column({ type: 'text', nullable: true })
  registrationUserAgent: string;

  @ApiPropertyOptional({
    description: 'Accepted terms and conditions version',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  acceptedTermsVersion: string;

  @ApiPropertyOptional({
    description: 'Accepted privacy policy version',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  acceptedPrivacyVersion: string;

  @ApiPropertyOptional({
    description: 'Marketing consent',
    example: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  marketingConsent: boolean;

  // Relations
  @ApiPropertyOptional({
    description: 'User profile information',
    type: () => UserProfile,
  })
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile: UserProfile;

  @ApiPropertyOptional({
    description: 'Audit logs for user actions',
    type: () => [AuditLog],
  })
  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @ApiPropertyOptional({
    description: 'Loans created by the user',
    type: () => [Loan],
  })
  @OneToMany(() => Loan, (loan) => loan.borrower)
  loans: Loan[];

  @ApiPropertyOptional({
    description: 'Transactions associated with the user',
    type: () => [Transaction],
  })
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @ApiPropertyOptional({
    description: 'Investments made by the user',
    type: () => [Investment],
  })
  @OneToMany(() => Investment, (investment) => investment.lender)
  investments: Investment[];

  @ApiPropertyOptional({
    description: 'KYC information for the user',
    type: () => Kyc,
  })
  @OneToOne(() => Kyc, (kyc) => kyc.user)
  kyc: Kyc;

  // Computed properties
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.accountStatus === AccountStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Whether KYC is verified',
    example: false,
  })
  @Expose()
  get isKycVerified(): boolean {
    return this.kycStatus === KycStatus.VERIFIED;
  }

  @ApiProperty({
    description: 'Whether email is verified',
    example: false,
  })
  @Expose()
  get isEmailVerified(): boolean {
    return this.verificationStatus === VerificationStatus.EMAIL_VERIFIED ||
           this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
  }

  @ApiProperty({
    description: 'Whether phone is verified',
    example: false,
  })
  @Expose()
  get isPhoneVerified(): boolean {
    return this.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
           this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
  }

  @ApiProperty({
    description: 'User age (calculated from date of birth)',
    example: 30,
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

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateAge() {
    if (this.dateOfBirth) {
      const age = this.age;
      if (age !== null && age < 18) {
        throw new Error('User must be at least 18 years old');
      }
      if (age !== null && age > 120) {
        throw new Error('Invalid date of birth');
      }
    }
  }

  @BeforeInsert()
  setRegistrationDefaults() {
    if (!this.registrationIp) {
      // In real app, get from request context
      this.registrationIp = '127.0.0.1';
    }
    if (!this.registrationUserAgent) {
      // In real app, get from request headers
      this.registrationUserAgent = 'CLI/1.0';
    }
    
    // Set current timestamp for password change
    this.lastPasswordChangeAt = new Date();
  }

  @AfterInsert()
  logInsert() {
    console.log(`User created: ${this.email} (${this.id})`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`User updated: ${this.email} (${this.id})`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`User removed: ${this.email} (${this.id})`);
  }

  // Business logic methods
  canRequestLoan(): boolean {
    return (
      this.isActive &&
      this.isKycVerified &&
      this.verificationStatus === VerificationStatus.FULLY_VERIFIED &&
      this.accountStatus === AccountStatus.ACTIVE
    );
  }

  canInvest(): boolean {
    return (
      this.isActive &&
      this.isKycVerified &&
      this.verificationStatus === VerificationStatus.FULLY_VERIFIED &&
      this.accountStatus === AccountStatus.ACTIVE &&
      this.role === UserRole.LENDER
    );
  }

  isAdmin(): boolean {
    return [
      UserRole.SYSTEM_ADMIN,
      UserRole.TRANSACTION_ADMIN,
      UserRole.COMPLIANCE_OFFICER,
      UserRole.RISK_ANALYST,
      UserRole.AUDITOR,
    ].includes(this.role);
  }

  updateActivity() {
    this.lastActivityAt = new Date();
  }

  verifyEmail() {
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

  verifyPhone() {
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

  suspend(reason: string) {
    this.accountStatus = AccountStatus.SUSPENDED;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  activate() {
    this.accountStatus = AccountStatus.ACTIVE;
    this.deactivationReason = null;
    this.deactivatedAt = null;
  }

  deactivate(reason: string) {
    this.accountStatus = AccountStatus.DEACTIVATED;
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  }

  completeKyc() {
    this.kycStatus = KycStatus.VERIFIED;
  }

  rejectKyc() {
    this.kycStatus = KycStatus.REJECTED;
  }

  setKycInProgress() {
    this.kycStatus = KycStatus.IN_PROGRESS;
  }
}