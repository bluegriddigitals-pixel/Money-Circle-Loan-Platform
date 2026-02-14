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
import { PayoutRequestType, PayoutMethod } from '../enums/payout.enum';

export class CreatePayoutRequestDto {
    @ApiProperty({
        description: 'ID of the user requesting the payout',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4')
    userId: string;

    @ApiPropertyOptional({
        description: 'ID of the escrow account (if applicable)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @IsOptional()
    @IsUUID('4')
    escrowAccountId?: string;

    @ApiProperty({
        description: 'Payout request type',
        enum: PayoutRequestType,
        example: PayoutRequestType.LOAN_DISBURSEMENT,
    })
    @IsEnum(PayoutRequestType)
    type: PayoutRequestType;

    @ApiProperty({
        description: 'Payout amount',
        example: 5000.0,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({
        description: 'Payout method',
        enum: PayoutMethod,
        example: PayoutMethod.BANK_TRANSFER,
    })
    @IsEnum(PayoutMethod)
    payoutMethod: PayoutMethod;

    @ApiProperty({
        description: 'Recipient name',
        example: 'Jane Doe',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    recipientName: string;

    @ApiPropertyOptional({
        description: 'Recipient email',
        example: 'jane.doe@example.com',
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
            accountHolder: 'Jane Doe',
        },
    })
    @IsOptional()
    @IsObject()
    paymentDetails?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Payout purpose/description',
        example: 'Loan disbursement for home renovation',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Internal reference/notes',
        example: 'Loan ID: L2024-001',
    })
    @IsOptional()
    @IsString()
    internalReference?: string;

    @ApiPropertyOptional({
        description: 'Additional metadata',
        example: { source: 'web', ipAddress: '192.168.1.1' },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Supporting documents',
        example: [
            { type: 'invoice', url: 'https://example.com/invoice.pdf', name: 'Invoice' },
            { type: 'agreement', url: 'https://example.com/agreement.pdf', name: 'Agreement' },
        ],
    })
    @IsOptional()
    @IsArray()
    supportingDocuments?: Array<{
        type: string;
        url: string;
        name: string;
    }>;
}