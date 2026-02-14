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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType, RepaymentFrequency, InterestType, LoanPurpose, LoanStatus } from '../enums/loan-status.enum';
import { LoanDocumentDto, CollateralDto } from './create-loan.dto';

export class UpdateLoanDto {
  @ApiPropertyOptional({ enum: LoanType, description: 'Loan type' })
  @IsEnum(LoanType)
  @IsOptional()
  type?: LoanType;

  @ApiPropertyOptional({ description: 'Loan amount', minimum: 100, maximum: 10000000 })
  @IsNumber()
  @Min(100)
  @Max(10000000)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Interest rate', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  interestRate?: number;

  @ApiPropertyOptional({ enum: InterestType, description: 'Interest type' })
  @IsEnum(InterestType)
  @IsOptional()
  interestType?: InterestType;

  @ApiPropertyOptional({ description: 'Loan term in months', minimum: 1, maximum: 360 })
  @IsNumber()
  @Min(1)
  @Max(360)
  @IsOptional()
  term?: number;

  @ApiPropertyOptional({ enum: RepaymentFrequency, description: 'Repayment frequency' })
  @IsEnum(RepaymentFrequency)
  @IsOptional()
  repaymentFrequency?: RepaymentFrequency;

  @ApiPropertyOptional({ enum: LoanPurpose, description: 'Loan purpose' })
  @IsEnum(LoanPurpose)
  @IsOptional()
  purpose?: LoanPurpose;

  @ApiPropertyOptional({ enum: LoanStatus, description: 'Loan status' })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({ description: 'Loan description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Required by date' })
  @IsDateString()
  @IsOptional()
  requiredByDate?: string;

  @ApiPropertyOptional({ description: 'Approval date' })
  @IsDateString()
  @IsOptional()
  approvalDate?: string;

  @ApiPropertyOptional({ description: 'Disbursement date' })
  @IsDateString()
  @IsOptional()
  disbursementDate?: string;

  @ApiPropertyOptional({ description: 'First payment date' })
  @IsDateString()
  @IsOptional()
  firstPaymentDate?: string;

  @ApiPropertyOptional({ description: 'Maturity date' })
  @IsDateString()
  @IsOptional()
  maturityDate?: string;

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

  @ApiPropertyOptional({ description: 'Rejection reason' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Notes for loan officer' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Approved by user ID' })
  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Underwriter user ID' })
  @IsUUID()
  @IsOptional()
  underwriterId?: string;

  @ApiPropertyOptional({ description: 'Loan officer user ID' })
  @IsUUID()
  @IsOptional()
  loanOfficerId?: string;
}