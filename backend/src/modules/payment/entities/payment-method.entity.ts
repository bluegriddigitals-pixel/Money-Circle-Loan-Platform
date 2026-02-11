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
  IsUUID,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsPositive,
  Min,
  Max,
  IsInt,
  IsObject,
  IsArray,
  MaxLength,
  MinLength,
  IsBoolean,
  IsCreditCard,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CRYPTO = 'crypto',
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  FRAUDULENT = 'fraudulent',
}

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  DINERS_CLUB = 'diners_club',
  JCB = 'jcb',
  UNIONPAY = 'unionpay',
  OTHER = 'other',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  MONEY_MARKET = 'money_market',
  BUSINESS_CHECKING = 'business_checking',
  BUSINESS_SAVINGS = 'business_savings',
}

@Entity('payment_methods')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['isDefault'])
@Index(['lastFourDigits'])
@Index(['createdAt'])
export class PaymentMethod {
  @ApiProperty({
    description: 'Unique identifier for the payment method',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'ID of the user who owns this payment method',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.CREDIT_CARD,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    nullable: false,
  })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({
    description: 'Payment method status',
    enum: PaymentMethodStatus,
    example: PaymentMethodStatus.ACTIVE,
    default: PaymentMethodStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.ACTIVE,
    nullable: false,
  })
  @IsEnum(PaymentMethodStatus)
  status: PaymentMethodStatus;

  @ApiPropertyOptional({
    description: 'Card type (if payment method is a card)',
    enum: CardType,
    example: CardType.VISA,
  })
  @Column({
    type: 'enum',
    enum: CardType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(CardType)
  cardType: CardType;

  @ApiPropertyOptional({
    description: 'Account type (if payment method is a bank account)',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @Column({
    type: 'enum',
    enum: AccountType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({
    description: 'Last four digits of the card/account',
    example: '1234',
  })
  @Column({ type: 'varchar', length: 4, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(4)
  lastFourDigits: string;

  @ApiProperty({
    description: 'Card/Account holder name',
    example: 'John Smith',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  holderName: string;

  @ApiPropertyOptional({
    description: 'Card expiry month (1-12)',
    example: 12,
    minimum: 1,
    maximum: 12,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiPropertyOptional({
    description: 'Card expiry year',
    example: 2026,
    minimum: 2024,
  })
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(2024)
  expiryYear: number;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'First National Bank',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName: string;

  @ApiPropertyOptional({
    description: 'Bank routing number (US)',
    example: '021000021',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  routingNumber: string;

  @ApiPropertyOptional({
    description: 'IBAN (International Bank Account Number)',
    example: 'GB29NWBK60161331926819',
  })
  @Column({ type: 'varchar', length: 34, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(34)
  iban: string;

  @ApiPropertyOptional({
    description: 'SWIFT/BIC code',
    example: 'BOFAUS3N',
  })
  @Column({ type: 'varchar', length: 11, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  swiftCode: string;

  @ApiPropertyOptional({
    description: 'Digital wallet provider',
    example: 'PayPal',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  walletProvider: string;

  @ApiPropertyOptional({
    description: 'Digital wallet ID',
    example: 'user123456@paypal.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  walletId: string;

  @ApiPropertyOptional({
    description: 'Cryptocurrency type',
    example: 'Bitcoin',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  cryptoType: string;

  @ApiPropertyOptional({
    description: 'Cryptocurrency wallet address',
    example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  cryptoAddress: string;

  @ApiProperty({
    description: 'Is this the default payment method',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isDefault: boolean;

  @ApiPropertyOptional({
    description: 'Payment gateway token/reference',
    example: 'tok_visa_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  gatewayToken: string;

  @ApiPropertyOptional({
    description: 'Payment gateway customer ID',
    example: 'cus_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  gatewayCustomerId: string;

  @ApiPropertyOptional({
    description: 'Billing address',
    example: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
      postalCode: '12345',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @ApiPropertyOptional({
    description: 'Verification method used',
    example: 'micro_deposits',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  verificationMethod: string;

  @ApiPropertyOptional({
    description: 'Verification date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  verifiedAt: Date;

  @ApiPropertyOptional({
    description: 'Verification attempts count',
    example: 1,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsInt()
  @Min(0)
  verificationAttempts: number;

  @ApiPropertyOptional({
    description: 'Failed verification attempts count',
    example: 0,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsInt()
  @Min(0)
  failedVerificationAttempts: number;

  @ApiPropertyOptional({
    description: 'Maximum daily transaction limit',
    example: 5000.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimit: number;

  @ApiPropertyOptional({
    description: 'Maximum monthly transaction limit',
    example: 15000.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLimit: number;

  @ApiPropertyOptional({
    description: 'Maximum per transaction limit',
    example: 2500.0,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perTransactionLimit: number;

  @ApiPropertyOptional({
    description: 'Daily transaction total',
    example: 500.0,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  dailyTotal: number;

  @ApiPropertyOptional({
    description: 'Monthly transaction total',
    example: 2500.0,
    minimum: 0,
    default: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  monthlyTotal: number;

  @ApiPropertyOptional({
    description: 'Last used date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastUsedAt: Date;

  @ApiPropertyOptional({
    description: 'Date when payment method will expire',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['primary', 'verified', 'high_limit'],
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
    example: 'User prefers this card for large transactions',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Verified via micro-deposits on 2024-01-15',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiProperty({
    description: 'Payment method creation timestamp',
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
    description: 'User who owns this payment method',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.paymentMethods, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Virtual/computed properties
  @ApiProperty({
    description: 'Is card expired',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isExpired(): boolean {
    if (!this.expiryMonth || !this.expiryYear) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    return (
      this.expiryYear < currentYear ||
      (this.expiryYear === currentYear && this.expiryMonth < currentMonth)
    );
  }

  @ApiProperty({
    description: 'Is payment method verified',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isVerified(): boolean {
    return this.status === PaymentMethodStatus.VERIFIED || this.status === PaymentMethodStatus.ACTIVE;
  }

  @ApiProperty({
    description: 'Is payment method active and usable',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return (
      (this.status === PaymentMethodStatus.ACTIVE || 
       this.status === PaymentMethodStatus.VERIFIED) &&
      !this.isExpired
    );
  }

  @ApiProperty({
    description: 'Card expiry date in MM/YY format',
    example: '12/26',
    readOnly: true,
  })
  @Expose()
  get expiryDate(): string | null {
    if (!this.expiryMonth || !this.expiryYear) return null;
    const month = this.expiryMonth.toString().padStart(2, '0');
    const year = this.expiryYear.toString().slice(-2);
    return `${month}/${year}`;
  }

  @ApiProperty({
    description: 'Masked card/account number',
    example: '**** **** **** 1234',
    readOnly: true,
  })
  @Expose()
  get maskedNumber(): string {
    switch (this.type) {
      case PaymentMethodType.CREDIT_CARD:
      case PaymentMethodType.DEBIT_CARD:
        return `**** **** **** ${this.lastFourDigits}`;
      case PaymentMethodType.BANK_ACCOUNT:
        return `****${this.lastFourDigits}`;
      case PaymentMethodType.DIGITAL_WALLET:
        return `${this.walletProvider}: ${this.walletId?.slice(0, 4)}...`;
      case PaymentMethodType.CRYPTO:
        return `${this.cryptoType}: ${this.cryptoAddress?.slice(0, 8)}...`;
      default:
        return `****${this.lastFourDigits}`;
    }
  }

  @ApiProperty({
    description: 'Payment method display name',
    example: 'Visa ending in 1234',
    readOnly: true,
  })
  @Expose()
  get displayName(): string {
    switch (this.type) {
      case PaymentMethodType.CREDIT_CARD:
        return `${this.cardType ? this.cardType.charAt(0).toUpperCase() + this.cardType.slice(1) : 'Card'} ending in ${this.lastFourDigits}`;
      case PaymentMethodType.DEBIT_CARD:
        return `${this.cardType ? this.cardType.charAt(0).toUpperCase() + this.cardType.slice(1) : 'Debit Card'} ending in ${this.lastFourDigits}`;
      case PaymentMethodType.BANK_ACCOUNT:
        return `${this.bankName || 'Bank Account'} ending in ${this.lastFourDigits}`;
      case PaymentMethodType.DIGITAL_WALLET:
        return `${this.walletProvider} Wallet`;
      case PaymentMethodType.CRYPTO:
        return `${this.cryptoType} Wallet`;
      default:
        return `${this.type.replace('_', ' ').toUpperCase()} ending in ${this.lastFourDigits}`;
    }
  }

  @ApiProperty({
    description: 'Is daily limit exceeded',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isDailyLimitExceeded(): boolean {
    if (!this.dailyLimit) return false;
    return this.dailyTotal >= this.dailyLimit;
  }

  @ApiProperty({
    description: 'Is monthly limit exceeded',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isMonthlyLimitExceeded(): boolean {
    if (!this.monthlyLimit) return false;
    return this.monthlyTotal >= this.monthlyLimit;
  }

  @ApiProperty({
    description: 'Daily limit remaining',
    example: 4500.0,
    readOnly: true,
  })
  @Expose()
  get dailyLimitRemaining(): number | null {
    if (!this.dailyLimit) return null;
    return Math.max(0, this.dailyLimit - this.dailyTotal);
  }

  @ApiProperty({
    description: 'Monthly limit remaining',
    example: 12500.0,
    readOnly: true,
  })
  @Expose()
  get monthlyLimitRemaining(): number | null {
    if (!this.monthlyLimit) return null;
    return Math.max(0, this.monthlyLimit - this.monthlyTotal);
  }

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateStatusBasedOnExpiry() {
    if (this.isExpired && this.status !== PaymentMethodStatus.EXPIRED) {
      this.status = PaymentMethodStatus.EXPIRED;
    }
    
    // Update version for optimistic locking
    if (this.id) {
      this.version += 1;
    }
  }

  // Business logic methods
  verify(method: string): void {
    if (this.status === PaymentMethodStatus.VERIFIED) {
      throw new Error('Payment method is already verified');
    }

    this.status = PaymentMethodStatus.VERIFIED;
    this.verifiedAt = new Date();
    this.verificationMethod = method;
    this.verificationAttempts += 1;
  }

  failVerification(): void {
    this.failedVerificationAttempts += 1;
    if (this.failedVerificationAttempts >= 3) {
      this.status = PaymentMethodStatus.SUSPENDED;
    }
  }

  suspend(reason: string = 'suspicious_activity'): void {
    this.status = PaymentMethodStatus.SUSPENDED;
    if (!this.metadata) this.metadata = {};
    this.metadata.suspensionReason = reason;
    this.metadata.suspendedAt = new Date();
  }

  activate(): void {
    if (this.isExpired) {
      throw new Error('Cannot activate expired payment method');
    }

    this.status = PaymentMethodStatus.ACTIVE;
    if (this.metadata) {
      delete this.metadata.suspensionReason;
      delete this.metadata.suspendedAt;
    }
  }

  setAsDefault(): void {
    this.isDefault = true;
  }

  removeDefault(): void {
    this.isDefault = false;
  }

  recordTransaction(amount: number): void {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    this.dailyTotal += amount;
    this.monthlyTotal += amount;
    this.lastUsedAt = new Date();

    // Check if we need to reset daily total (assuming this is called daily)
    const now = new Date();
    const lastUpdate = this.updatedAt || this.createdAt;
    if (lastUpdate && now.getDate() !== lastUpdate.getDate()) {
      this.dailyTotal = 0;
    }

    // Check if we need to reset monthly total
    if (lastUpdate && now.getMonth() !== lastUpdate.getMonth()) {
      this.monthlyTotal = 0;
    }
  }

  canProcessTransaction(amount: number): boolean {
    if (!this.isActive) return false;
    if (this.isExpired) return false;
    if (amount <= 0) return false;
    
    if (this.perTransactionLimit && amount > this.perTransactionLimit) return false;
    if (this.dailyLimit && (this.dailyTotal + amount) > this.dailyLimit) return false;
    if (this.monthlyLimit && (this.monthlyTotal + amount) > this.monthlyLimit) return false;
    
    return true;
  }

  // Validation methods
  @Expose()
  get isValid(): boolean {
    if (!this.type || !this.lastFourDigits || !this.holderName) return false;
    
    switch (this.type) {
      case PaymentMethodType.CREDIT_CARD:
      case PaymentMethodType.DEBIT_CARD:
        return !!(this.cardType && this.expiryMonth && this.expiryYear);
      case PaymentMethodType.BANK_ACCOUNT:
        return !!(this.accountType && this.bankName);
      case PaymentMethodType.DIGITAL_WALLET:
        return !!(this.walletProvider && this.walletId);
      case PaymentMethodType.CRYPTO:
        return !!(this.cryptoType && this.cryptoAddress);
      default:
        return true;
    }
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

  updateLimits(limits: {
    dailyLimit?: number;
    monthlyLimit?: number;
    perTransactionLimit?: number;
  }): void {
    if (limits.dailyLimit !== undefined) this.dailyLimit = limits.dailyLimit;
    if (limits.monthlyLimit !== undefined) this.monthlyLimit = limits.monthlyLimit;
    if (limits.perTransactionLimit !== undefined) this.perTransactionLimit = limits.perTransactionLimit;
  }

  // JSON serialization
  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      maskedNumber: this.maskedNumber,
      lastFourDigits: this.lastFourDigits,
      holderName: this.holderName,
      status: this.status,
      isDefault: this.isDefault,
      isActive: this.isActive,
      isExpired: this.isExpired,
      isVerified: this.isVerified,
      expiryDate: this.expiryDate,
      dailyLimitRemaining: this.dailyLimitRemaining,
      monthlyLimitRemaining: this.monthlyLimitRemaining,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}