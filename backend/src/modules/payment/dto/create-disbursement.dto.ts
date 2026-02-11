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
  IsEmail,
  IsPhoneNumber,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DisbursementType, DisbursementMethod } from "../enums/disbursement.enum";

export class CreateDisbursementDto {
  @ApiProperty({
    description: 'ID of the associated loan',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  loanId: string;

  @ApiPropertyOptional({
    description: 'ID of the escrow account used for disbursement',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4')
  escrowAccountId?: string;

  @ApiProperty({
    description: 'Disbursement type',
    enum: DisbursementType,
    example: DisbursementType.LOAN_DISBURSEMENT,
  })
  @IsEnum(DisbursementType)
  type: DisbursementType;

  @ApiProperty({
    description: 'Total disbursement amount',
    example: 50000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Disbursement method',
    enum: DisbursementMethod,
    example: DisbursementMethod.BANK_TRANSFER,
  })
  @IsEnum(DisbursementMethod)
  method: DisbursementMethod;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Borrower',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipientName: string;

  @ApiPropertyOptional({
    description: 'Recipient email',
    example: 'john.borrower@example.com',
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({
    description: 'Recipient phone',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  recipientPhone?: string;

  @ApiPropertyOptional({
    description: 'Payment details (bank account, wallet, etc.)',
    example: {
      bankName: 'First National Bank',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      accountHolder: 'John Borrower',
    },
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Disbursement instructions',
    example: 'Disburse in two equal installments',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Scheduled disbursement date',
  })
  @IsOptional()
  @Type(() => Date)
  scheduledDate?: Date;

  @ApiPropertyOptional({
    description: 'Disbursement schedule (for multiple installments)',
    example: [
      { amount: 25000, dueDate: '2024-02-01' },
      { amount: 25000, dueDate: '2024-03-01' },
    ],
  })
  @IsOptional()
  @IsArray()
  schedule?: Array<{
    amount: number;
    dueDate: Date;
  }>;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    example: [
      { type: 'loan_agreement', url: 'https://example.com/agreement.pdf', name: 'Loan Agreement' },
      { type: 'id_verification', url: 'https://example.com/id.pdf', name: 'ID Verification' },
    ],
  })
  @IsOptional()
  supportingDocuments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}