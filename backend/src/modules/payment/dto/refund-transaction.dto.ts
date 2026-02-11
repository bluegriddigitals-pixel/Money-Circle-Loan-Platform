import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class RefundTransactionDto {
  @ApiPropertyOptional({
    description: 'Refund reason',
    example: 'Customer requested refund',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}