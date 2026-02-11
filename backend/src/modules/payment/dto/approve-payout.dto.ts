import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ApprovePayoutDto {
  @ApiProperty({
    description: 'ID of the user approving the payout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Approval notes',
    example: 'Approved as per loan agreement',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}