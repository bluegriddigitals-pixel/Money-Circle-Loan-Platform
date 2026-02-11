import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EnableTwoFactorDto {
  @ApiPropertyOptional({
    description: '2FA method (authenticator, sms, email)',
    example: 'authenticator',
    default: 'authenticator',
  })
  @IsOptional()
  @IsString()
  method?: string;
}