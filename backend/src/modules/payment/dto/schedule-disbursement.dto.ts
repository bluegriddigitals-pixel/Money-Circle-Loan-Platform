import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDisbursementDto {
  @ApiProperty({
    description: 'Scheduled disbursement date',
    example: '2024-02-01T10:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  scheduledDate: Date;
}