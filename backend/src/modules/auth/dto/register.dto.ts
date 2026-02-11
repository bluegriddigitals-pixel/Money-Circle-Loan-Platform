import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsPhoneNumber, 
  IsBoolean, 
  IsArray, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../user/entities/user.entity';

export class SecurityQuestionDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  answer: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.BORROWER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // ============ MISSING PROPERTIES - ADD THESE ============
  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  termsVersion?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  privacyVersion?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional({ type: [SecurityQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  securityQuestions?: SecurityQuestionDto[];

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'summer2024' })
  @IsOptional()
  @IsString()
  campaign?: string;

  @ApiPropertyOptional({ example: 'organic' })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiPropertyOptional({ example: 'REF123' })
  @IsOptional()
  @IsString()
  referralCode?: string;
  // ========================================================
}