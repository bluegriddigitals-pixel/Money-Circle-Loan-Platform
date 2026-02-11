import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Client information for security logging',
    example: { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
  })
  @IsOptional()
  clientInfo?: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  };
}