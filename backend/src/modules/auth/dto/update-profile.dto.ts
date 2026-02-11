import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsPhoneNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationPreferencesDto {
  @IsOptional()
  @IsObject()
  email?: Record<string, any>;
  
  @IsOptional()
  @IsObject()
  sms?: Record<string, any>;
  
  @IsOptional()
  @IsObject()
  push?: Record<string, any>;
  
  @IsOptional()
  @IsObject()
  marketing?: Record<string, any>;
}

class PrivacySettingsDto {
  @IsOptional()
  @IsString()
  profileVisibility?: string;
  
  @IsOptional()
  @IsString()
  activityVisibility?: string;
  
  @IsOptional()
  searchVisibility?: boolean;
}

class SecuritySettingsDto {
  @IsOptional()
  twoFactorEnabled?: boolean;
  
  @IsOptional()
  biometricEnabled?: boolean;
  
  @IsOptional()
  sessionTimeout?: number;
  
  @IsOptional()
  loginAlerts?: boolean;
  
  @IsOptional()
  unusualActivityAlerts?: boolean;
}

class PreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notification?: NotificationPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacy?: PrivacySettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  security?: SecuritySettingsDto;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'User preferences' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}