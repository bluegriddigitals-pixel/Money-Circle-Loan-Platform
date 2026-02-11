import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: '2FA verification code',
    example: '123456',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: '2FA method (authenticator, sms, email, backup)',
    example: 'authenticator',
  })
  @IsString()
  method: string;
}