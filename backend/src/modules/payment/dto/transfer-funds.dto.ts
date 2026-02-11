import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class TransferFundsDto {
  @ApiProperty({
    description: 'ID of the source escrow account',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  fromEscrowAccountId: string;

  @ApiProperty({
    description: 'ID of the destination escrow account',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4')
  toEscrowAccountId: string;

  @ApiProperty({
    description: 'Transfer amount',
    example: 5000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Transfer description',
    example: 'Transfer to loan repayment escrow',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}