import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType, RepaymentFrequency, InterestType, LoanPurpose } from '../enums/loan-status.enum';

export class LoanDocumentDto {
  @ApiProperty({ description: 'Document type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Document URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Document name' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class CollateralDto {
  @ApiProperty({ description: 'Collateral type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Collateral value' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Collateral description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Collateral documents' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanDocumentDto)
  @IsOptional()
  documents?: LoanDocumentDto[];
}

export class CreateLoanDto {
  @ApiProperty({ enum: LoanType, description: 'Loan type' })
  @IsEnum(LoanType)
  type: LoanType;

  @ApiProperty({ description: 'Loan amount', minimum: 100, maximum: 10000000 })
  @IsNumber()
  @Min(100)
  @Max(10000000)
  amount: number;

  @ApiProperty({ description: 'Interest rate', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiProperty({ enum: InterestType, description: 'Interest type' })
  @IsEnum(InterestType)
  interestType: InterestType;

  @ApiProperty({ description: 'Loan term in months', minimum: 1, maximum: 360 })
  @IsNumber()
  @Min(1)
  @Max(360)
  term: number;

  @ApiProperty({ enum: RepaymentFrequency, description: 'Repayment frequency' })
  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ enum: LoanPurpose, description: 'Loan purpose' })
  @IsEnum(LoanPurpose)
  purpose: LoanPurpose;

  @ApiPropertyOptional({ description: 'Loan description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Application date' })
  @IsDateString()
  @IsOptional()
  applicationDate?: string;

  @ApiPropertyOptional({ description: 'Required by date' })
  @IsDateString()
  @IsOptional()
  requiredByDate?: string;

  @ApiPropertyOptional({ description: 'Loan documents' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanDocumentDto)
  @IsOptional()
  documents?: LoanDocumentDto[];

  @ApiPropertyOptional({ description: 'Collateral information' })
  @ValidateNested()
  @Type(() => CollateralDto)
  @IsOptional()
  collateral?: CollateralDto;

  @ApiPropertyOptional({ description: 'Has collateral' })
  @IsBoolean()
  @IsOptional()
  hasCollateral?: boolean;

  @ApiPropertyOptional({ description: 'Existing loan ID if refinancing' })
  @IsUUID()
  @IsOptional()
  existingLoanId?: string;

  @ApiPropertyOptional({ description: 'Notes for loan officer' })
  @IsString()
  @IsOptional()
  notes?: string;
}