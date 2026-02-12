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
  IsBoolean,
  IsObject,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { User } from '../../user/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  WALLET = 'wallet',
  CRYPTO = 'crypto',
}

export enum PaymentMethodStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  VERIFIED = 'verified',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Entity('payment_methods')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['lastFour'])
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
    description: 'User ID who owns this payment method',
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
    default: PaymentMethodStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.PENDING,
    nullable: false,
  })
  @IsEnum(PaymentMethodStatus)
  status: PaymentMethodStatus;

  @ApiProperty({
    description: 'Payment method name/title',
    example: 'Chase Sapphire Preferred',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Card/Bank last 4 digits',
    example: '4242',
  })
  @Column({ type: 'varchar', length: 4, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  lastFour: string;

  @ApiPropertyOptional({
    description: 'Card expiry month',
    example: 12,
    minimum: 1,
    maximum: 12,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiPropertyOptional({
    description: 'Card expiry year',
    example: 2025,
    minimum: 2024,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  expiryYear: number;

  @ApiPropertyOptional({
    description: 'Card brand (Visa, Mastercard, etc.)',
    example: 'Visa',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  brand: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Chase Bank',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  bankName: string;

  @ApiPropertyOptional({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  accountHolderName: string;

  @ApiPropertyOptional({
    description: 'Account holder email',
    example: 'john.doe@example.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  accountHolderEmail: string;

  @ApiPropertyOptional({
    description: 'Billing address',
    example: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  billingAddress: Record<string, any>;

  @ApiHideProperty()
  @Column({ type: 'text', nullable: true })
  @Exclude({ toPlainOnly: true })
  gatewayToken: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  gatewayCustomerId: string;

  @ApiHideProperty()
  @Column({ type: 'text', nullable: true })
  @Exclude({ toPlainOnly: true })
  encryptedDetails: string;

  @ApiProperty({
    description: 'Whether this is the default payment method',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({
    description: 'Whether the payment method is verified',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'Verification method used',
    example: 'micro_deposit',
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
  verifiedAt: Date;

  @ApiPropertyOptional({
    description: 'Last used date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt: Date;

  @ApiPropertyOptional({
    description: 'Total amount processed',
    example: 5000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  totalProcessed: number;

  @ApiPropertyOptional({
    description: 'Total transaction count',
    example: 25,
    minimum: 0,
  })
  @Column({ type: 'int', default: 0, nullable: false })
  @IsNumber()
  @Min(0)
  transactionCount: number;

  @ApiPropertyOptional({
    description: 'Success rate percentage',
    example: 98.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successRate: number;

  @ApiPropertyOptional({
    description: 'Daily limit',
    example: 10000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimit: number;

  @ApiPropertyOptional({
    description: 'Monthly limit',
    example: 50000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLimit: number;

  @ApiPropertyOptional({
    description: 'Per transaction limit',
    example: 5000.00,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perTransactionLimit: number;

  @ApiPropertyOptional({
    description: 'Failure reason if verification failed',
    example: 'Invalid card number',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  failureReason: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { cardType: 'premium', issuerCountry: 'US' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

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

  // Relations
  @ManyToOne(() => User, (user) => user.paymentMethods, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
  transactions: Transaction[];

  // Virtual properties
  @ApiProperty({
    description: 'Is payment method active',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isActive(): boolean {
    return this.status === PaymentMethodStatus.ACTIVE || this.status === PaymentMethodStatus.VERIFIED;
  }

  @ApiProperty({
    description: 'Is payment method expired',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isExpired(): boolean {
    if (!this.expiryYear || !this.expiryMonth) return false;
    const now = new Date();
    const expiry = new Date(this.expiryYear, this.expiryMonth, 1);
    return now > expiry;
  }

  @ApiProperty({
    description: 'Masked identifier',
    example: '•••• 4242',
    readOnly: true,
  })
  @Expose()
  get maskedIdentifier(): string {
    if (this.lastFour) {
      return `•••• ${this.lastFour}`;
    }
    return '•••• •••• •••• ••••';
  }

  // Methods
  verify(method: string): void {
    this.isVerified = true;
    this.verificationMethod = method;
    this.verifiedAt = new Date();
    this.status = PaymentMethodStatus.VERIFIED;
  }

  recordTransaction(amount: number): void {
    this.transactionCount += 1;
    this.totalProcessed += amount;
    this.lastUsedAt = new Date();
  }

  canProcessTransaction(amount: number): boolean {
    if (!this.isActive) return false;
    if (this.isExpired) return false;
    if (this.perTransactionLimit && amount > this.perTransactionLimit) return false;
    return true;
  }

  // JSON serialization
  toJSON(): Partial<PaymentMethod> {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      name: this.name,
      lastFour: this.lastFour,
      brand: this.brand,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      bankName: this.bankName,
      accountHolderName: this.accountHolderName,
      isDefault: this.isDefault,
      isVerified: this.isVerified,
      isActive: this.isActive,
      isExpired: this.isExpired,
      maskedIdentifier: this.maskedIdentifier,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}