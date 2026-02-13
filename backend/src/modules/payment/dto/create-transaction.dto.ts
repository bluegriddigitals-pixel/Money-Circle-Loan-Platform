import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsUUID,
    Min,
    MaxLength,
} from 'class-validator';
import { TransactionType, TransactionStatus } from '../enums/transaction.enum';

export class CreateTransactionDto {
    @ApiPropertyOptional({
        description: 'ID of the loan associated with this transaction',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID('4')
    loanId?: string;

    @ApiPropertyOptional({
        description: 'ID of the escrow account associated with this transaction',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @IsOptional()
    @IsUUID('4')
    escrowAccountId?: string;

    @ApiPropertyOptional({
        description: 'ID of the payment method used for this transaction',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @IsOptional()
    @IsUUID('4')
    paymentMethodId?: string;

    @ApiProperty({
        description: 'Type of transaction',
        enum: TransactionType,
        example: TransactionType.DEPOSIT,
    })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({
        description: 'Transaction status',
        enum: TransactionStatus,
        example: TransactionStatus.PENDING,
        default: TransactionStatus.PENDING,
    })
    @IsEnum(TransactionStatus)
    @IsOptional()
    status?: TransactionStatus = TransactionStatus.PENDING;

    @ApiProperty({
        description: 'Transaction amount',
        example: 1000.0,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiPropertyOptional({
        description: 'ID of the user who initiated the transaction',
        example: '123e4567-e89b-12d3-a456-426614174004',
    })
    @IsOptional()
    @IsUUID('4')
    userId?: string;

    @ApiPropertyOptional({
        description: 'Transaction currency',
        example: 'USD',
        default: 'USD',
    })
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string = 'USD';

    @ApiPropertyOptional({
        description: 'Transaction description',
        example: 'Loan application fee',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Transaction reference from external system',
        example: 'txn_123456789',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    transactionReference?: string;

    @ApiPropertyOptional({
        description: 'Additional metadata',
        example: { invoiceNumber: 'INV-2024-001' },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}