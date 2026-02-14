import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, AccountStatus, VerificationStatus } from '../entities/user.entity';

export class SecurityQuestionDto {
  @ApiPropertyOptional({ description: 'Security question' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ description: 'Answer to security question' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  answer?: string;
}

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  marketing?: boolean;
}

export class PrivacySettingsDto {
  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'], default: 'PRIVATE' })
  @IsString()
  @IsOptional()
  profileVisibility?: string;

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'], default: 'FRIENDS_ONLY' })
  @IsString()
  @IsOptional()
  activityVisibility?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  searchVisibility?: boolean;
}

export class SecuritySettingsDto {
  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  biometricEnabled?: boolean;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  sessionTimeout?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  loginAlerts?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  unusualActivityAlerts?: boolean;
}

export class PreferencesDto {
  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  @IsOptional()
  notification?: NotificationPreferencesDto;

  @ApiPropertyOptional({ type: PrivacySettingsDto })
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  @IsOptional()
  privacy?: PrivacySettingsDto;

  @ApiPropertyOptional({ type: SecuritySettingsDto })
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  @IsOptional()
  security?: SecuritySettingsDto;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s\-']+$/, { message: 'First name can only contain letters, spaces, hyphens and apostrophes' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s\-']+$/, { message: 'Last name can only contain letters, spaces, hyphens and apostrophes' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+27821234567' })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  @IsOptional()
  accountStatus?: AccountStatus;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsEnum(VerificationStatus)
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  termsVersion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  privacyVersion?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  @IsOptional()
  securityQuestions?: SecurityQuestionDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employerName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional()
  @IsOptional()
  yearsEmployed?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ type: PreferencesDto })
  @ValidateNested()
  @Type(() => PreferencesDto)
  @IsOptional()
  preferences?: PreferencesDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialLinks?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  updatedBy?: string;
}