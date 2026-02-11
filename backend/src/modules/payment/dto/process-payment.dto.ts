import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID of the payment method to use',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  paymentMethodId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 1000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Payment currency',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = 'USD';

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Loan repayment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'ID of the loan associated with this payment',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4')
  loanId?: string;

  @ApiPropertyOptional({
    description: 'ID of the escrow account',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId?: string;

  @ApiPropertyOptional({
    description: 'User ID making the payment',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { invoiceId: 'INV-2024-001', customerNote: 'Thank you!' },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether to create a failed transaction record if payment fails',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  createFailedTransaction?: boolean = true;
}