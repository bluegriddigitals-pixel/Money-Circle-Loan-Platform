import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType, PaymentMethodStatus, CardType, AccountType } from "../enums/payment-method.enum";

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'ID of the user who owns this payment method',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.CREDIT_CARD,
  })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiPropertyOptional({
    description: 'Card type (if payment method is a card)',
    enum: CardType,
    example: CardType.VISA,
  })
  @IsOptional()
  @IsEnum(CardType)
  cardType?: CardType;

  @ApiPropertyOptional({
    description: 'Account type (if payment method is a bank account)',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiProperty({
    description: 'Last four digits of the card/account',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(4)
  lastFourDigits: string;

  @ApiProperty({
    description: 'Card/Account holder name',
    example: 'John Smith',
  })
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
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiPropertyOptional({
    description: 'Card expiry year',
    example: 2026,
    minimum: 2024,
  })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  expiryYear?: number;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'First National Bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway token/reference',
    example: 'tok_visa_123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayToken?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway customer ID',
    example: 'cus_123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayCustomerId?: string;

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
  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>;

  @ApiProperty({
    description: 'Is this the default payment method',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { verified: true, verificationDate: '2024-01-15' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}