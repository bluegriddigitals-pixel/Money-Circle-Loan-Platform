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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class SecurityQuestionDto {
  @ApiProperty({ description: 'Security question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Answer to security question' })
  @IsString()
  @MinLength(2)
  answer: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s\-']+$/, { message: 'First name can only contain letters, spaces, hyphens and apostrophes' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s\-']+$/, { message: 'Last name can only contain letters, spaces, hyphens and apostrophes' })
  lastName: string;

  @ApiProperty({ example: '+27821234567', description: 'User phone number' })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01', description: 'User date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BORROWER, description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiPropertyOptional({ description: 'Terms and conditions version accepted' })
  @IsString()
  @IsOptional()
  termsVersion?: string;

  @ApiPropertyOptional({ description: 'Privacy policy version accepted' })
  @IsString()
  @IsOptional()
  privacyVersion?: string;

  @ApiPropertyOptional({ description: 'Marketing consent', default: false })
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiPropertyOptional({ description: 'Data processing consent', default: false })
  @IsBoolean()
  @IsOptional()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional({ description: 'Registration source (web, mobile, referral)' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Campaign source' })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiPropertyOptional({ description: 'Medium source' })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiPropertyOptional({ description: 'Referral code' })
  @IsString()
  @IsOptional()
  referralCode?: string;

  @ApiPropertyOptional({ description: 'Security questions for account recovery' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  @IsOptional()
  securityQuestions?: SecurityQuestionDto[];

  @ApiPropertyOptional({ description: 'Employment status' })
  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @ApiPropertyOptional({ description: 'Employer name' })
  @IsString()
  @IsOptional()
  employerName?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Monthly income' })
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional({ description: 'Years employed' })
  @IsOptional()
  yearsEmployed?: number;

  @ApiPropertyOptional({ description: 'Preferred language' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Preferred currency' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'ID number' })
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiPropertyOptional({ description: 'ID type' })
  @IsString()
  @IsOptional()
  idType?: string;

  @ApiPropertyOptional({ description: 'Nationality' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Device fingerprint' })
  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}