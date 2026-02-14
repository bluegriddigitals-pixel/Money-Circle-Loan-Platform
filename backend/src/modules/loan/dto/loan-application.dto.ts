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
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType, RepaymentFrequency, LoanStatus } from '../entities/loan.entity';

// MOVED TO THE TOP - BEFORE IT'S USED
export class UserBasicInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phoneNumber?: string;
}

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

  @ApiPropertyOptional({ description: 'Document metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
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

export class GuarantorDto {
  @ApiProperty({ description: 'Guarantor full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Guarantor email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Guarantor phone number' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Guarantor relationship to borrower' })
  @IsString()
  @IsOptional()
  relationship?: string;

  @ApiPropertyOptional({ description: 'Guarantor employment status' })
  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @ApiPropertyOptional({ description: 'Guarantor annual income' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  annualIncome?: number;

  @ApiPropertyOptional({ description: 'Guarantor identification number' })
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiPropertyOptional({ description: 'Guarantor documents' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanDocumentDto)
  @IsOptional()
  documents?: LoanDocumentDto[];
}

export class CreateLoanApplicationDto {
  @ApiProperty({ enum: LoanType, description: 'Loan type' })
  @IsEnum(LoanType)
  type: LoanType;

  @ApiProperty({ description: 'Loan amount', minimum: 100, maximum: 10000000 })
  @IsNumber()
  @Min(100)
  @Max(10000000)
  amount: number;

  @ApiProperty({ description: 'Loan tenure in months', minimum: 1, maximum: 360 })
  @IsNumber()
  @Min(1)
  @Max(360)
  tenureMonths: number;

  @ApiProperty({ description: 'Interest rate', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiProperty({ enum: RepaymentFrequency, description: 'Repayment frequency' })
  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @ApiPropertyOptional({ description: 'Loan purpose' })
  @IsString()
  @IsOptional()
  purpose?: string;

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

  @ApiPropertyOptional({ description: 'Guarantors' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuarantorDto)
  @IsOptional()
  guarantors?: GuarantorDto[];

  @ApiPropertyOptional({ description: 'Has collateral' })
  @IsBoolean()
  @IsOptional()
  hasCollateral?: boolean;

  @ApiPropertyOptional({ description: 'Has guarantors' })
  @IsBoolean()
  @IsOptional()
  hasGuarantors?: boolean;

  @ApiPropertyOptional({ description: 'Existing loan ID if refinancing' })
  @IsUUID()
  @IsOptional()
  existingLoanId?: string;

  @ApiPropertyOptional({ description: 'Notes for loan officer' })
  @IsString()
  @IsOptional()
  notes?: string;

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
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional({ description: 'Years employed' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsEmployed?: number;

  @ApiPropertyOptional({ description: 'Credit score' })
  @IsNumber()
  @Min(300)
  @Max(850)
  @IsOptional()
  creditScore?: number;

  @ApiPropertyOptional({ description: 'Application source' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Campaign source' })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiPropertyOptional({ description: 'Referral code' })
  @IsString()
  @IsOptional()
  referralCode?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateLoanApplicationDto {
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

  @ApiPropertyOptional({ description: 'Loan tenure in months', minimum: 1, maximum: 360 })
  @IsNumber()
  @Min(1)
  @Max(360)
  @IsOptional()
  tenureMonths?: number;

  @ApiPropertyOptional({ description: 'Interest rate', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  interestRate?: number;

  @ApiPropertyOptional({ enum: RepaymentFrequency, description: 'Repayment frequency' })
  @IsEnum(RepaymentFrequency)
  @IsOptional()
  repaymentFrequency?: RepaymentFrequency;

  @ApiPropertyOptional({ enum: LoanStatus, description: 'Application status' })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({ description: 'Loan purpose' })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Loan description' })
  @IsString()
  @IsOptional()
  description?: string;

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

  @ApiPropertyOptional({ description: 'Guarantors' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuarantorDto)
  @IsOptional()
  guarantors?: GuarantorDto[];

  @ApiPropertyOptional({ description: 'Has collateral' })
  @IsBoolean()
  @IsOptional()
  hasCollateral?: boolean;

  @ApiPropertyOptional({ description: 'Has guarantors' })
  @IsBoolean()
  @IsOptional()
  hasGuarantors?: boolean;

  @ApiPropertyOptional({ description: 'Notes for loan officer' })
  @IsString()
  @IsOptional()
  notes?: string;

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
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional({ description: 'Years employed' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsEmployed?: number;

  @ApiPropertyOptional({ description: 'Credit score' })
  @IsNumber()
  @Min(300)
  @Max(850)
  @IsOptional()
  creditScore?: number;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reviewer notes' })
  @IsString()
  @IsOptional()
  reviewerNotes?: string;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class LoanApplicationFilterDto {
  @ApiPropertyOptional({ enum: LoanStatus, description: 'Filter by status' })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({ enum: LoanType, description: 'Filter by loan type' })
  @IsEnum(LoanType)
  @IsOptional()
  type?: LoanType;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Minimum amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Start date for application date range' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for application date range' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search term for purpose or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort order' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class LoanApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationNumber: string;

  @ApiProperty({ enum: LoanType })
  type: LoanType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  tenureMonths: number;

  @ApiProperty()
  interestRate: number;

  @ApiProperty({ enum: RepaymentFrequency })
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ enum: LoanStatus })
  status: LoanStatus;

  @ApiPropertyOptional()
  purpose?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  applicationDate: Date;

  @ApiPropertyOptional()
  requiredByDate?: Date;

  @ApiProperty()
  borrowerId: string;

  @ApiProperty({ type: UserBasicInfoDto })
  @Type(() => UserBasicInfoDto)
  borrower: UserBasicInfoDto;

  @ApiPropertyOptional({ type: [LoanDocumentDto] })
  @Type(() => LoanDocumentDto)
  documents?: LoanDocumentDto[];

  @ApiPropertyOptional({ type: CollateralDto })
  @Type(() => CollateralDto)
  collateral?: CollateralDto;

  @ApiPropertyOptional({ type: [GuarantorDto] })
  @Type(() => GuarantorDto)
  guarantors?: GuarantorDto[];

  @ApiPropertyOptional()
  hasCollateral?: boolean;

  @ApiPropertyOptional()
  hasGuarantors?: boolean;

  @ApiPropertyOptional()
  existingLoanId?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  employmentStatus?: string;

  @ApiPropertyOptional()
  employerName?: string;

  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional()
  yearsEmployed?: number;

  @ApiPropertyOptional()
  creditScore?: number;

  @ApiPropertyOptional()
  source?: string;

  @ApiPropertyOptional()
  campaign?: string;

  @ApiPropertyOptional()
  referralCode?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  reviewerNotes?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiPropertyOptional()
  reviewedBy?: string;

  @ApiPropertyOptional()
  reviewedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  loanId?: string;

  @ApiProperty()
  get isComplete(): boolean {
    return !!this.documents?.length && 
           (!this.hasCollateral || !!this.collateral) &&
           (!this.hasGuarantors || this.guarantors?.length > 0);
  }
}