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
  IsEmail,
  IsPhoneNumber,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EscrowAccountType } from "../enums/escrow.enum";

export class CreateEscrowAccountDto {
  @ApiPropertyOptional({
    description: 'ID of the associated loan',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  loanId?: string;

  @ApiProperty({
    description: 'Escrow account name',
    example: 'Loan Disbursement Escrow - Loan #L2024-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  accountName: string;

  @ApiProperty({
    description: 'Escrow account type',
    enum: EscrowAccountType,
    example: EscrowAccountType.LOAN_DISBURSEMENT,
    default: EscrowAccountType.GENERAL,
  })
  @IsEnum(EscrowAccountType)
  type: EscrowAccountType = EscrowAccountType.GENERAL;

  @ApiPropertyOptional({
    description: 'Initial deposit amount',
    example: 50000.0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialAmount?: number = 0;

  @ApiPropertyOptional({
    description: 'Minimum required balance',
    example: 1000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance?: number;

  @ApiPropertyOptional({
    description: 'Maximum allowed balance',
    example: 100000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumBalance?: number;

  @ApiProperty({
    description: 'Escrow holder name',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  holderName: string;

  @ApiPropertyOptional({
    description: 'Escrow holder email',
    example: 'john.smith@example.com',
  })
  @IsOptional()
  @IsEmail()
  holderEmail?: string;

  @ApiPropertyOptional({
    description: 'Escrow holder phone',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  holderPhone?: string;

  @ApiPropertyOptional({
    description: 'Beneficiary name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  beneficiaryName?: string;

  @ApiPropertyOptional({
    description: 'Beneficiary email',
    example: 'jane.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  beneficiaryEmail?: string;

  @ApiPropertyOptional({
    description: 'Bank account details for withdrawals',
    example: {
      bankName: 'First National Bank',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      accountType: 'checking',
    },
  })
  @IsOptional()
  @IsObject()
  bankAccount?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Release conditions',
    example: ['loan_approval', 'contract_signing', 'property_inspection'],
  })
  @IsOptional()
  @IsArray()
  releaseConditions?: string[];

  @ApiPropertyOptional({
    description: 'Interest rate for funds held',
    example: 2.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @ApiPropertyOptional({
    description: 'Maturity/Release date',
  })
  @IsOptional()
  @Type(() => Date)
  maturityDate?: Date;

  @ApiPropertyOptional({
    description: 'Notes/comments',
    example: 'Escrow for initial loan disbursement',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}