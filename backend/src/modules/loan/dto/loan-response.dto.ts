import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { LoanType, RepaymentFrequency, LoanStatus } from '../entities/loan.entity';

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

export class LoanDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiProperty()
  uploadedAt: Date;
}

export class CollateralResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [LoanDocumentResponseDto] })
  @Type(() => LoanDocumentResponseDto)
  documents: LoanDocumentResponseDto[];
}

export class RepaymentScheduleItemDto {
  @ApiProperty()
  period: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  principal: number;

  @ApiProperty()
  interest: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  remainingBalance: number;

  @ApiProperty()
  status: string;
}

@Exclude()
export class LoanResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  loanNumber: string;

  @Expose()
  @ApiProperty({ enum: LoanType })
  type: LoanType;

  @Expose()
  @ApiProperty()
  amount: number;

  @Expose()
  @ApiProperty()
  interestRate: number;

  @Expose()
  @ApiProperty()
  tenureMonths: number;

  @Expose()
  @ApiProperty({ enum: RepaymentFrequency })
  repaymentFrequency: RepaymentFrequency;

  @Expose()
  @ApiPropertyOptional()
  purpose?: string;

  @Expose()
  @ApiProperty({ enum: LoanStatus })
  status: LoanStatus;

  @Expose()
  @ApiProperty()
  amountPaid: number;

  @Expose()
  @ApiProperty()
  outstandingBalance: number;

  @Expose()
  @ApiPropertyOptional()
  totalInterest?: number;

  @Expose()
  @ApiPropertyOptional()
  totalFees?: number;

  @Expose()
  @ApiPropertyOptional()
  monthlyInstallment?: number;

  @Expose()
  @ApiPropertyOptional()
  disbursementDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  firstRepaymentDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  lastRepaymentDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  approvedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  approvedBy?: string;

  @Expose()
  @ApiPropertyOptional()
  rejectedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  rejectionReason?: string;

  @Expose()
  @ApiPropertyOptional()
  defaultedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  defaultReason?: string;

  @Expose()
  @ApiPropertyOptional()
  completedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  currency?: string;

  @Expose()
  @ApiPropertyOptional()
  gracePeriodDays?: number;

  @Expose()
  @ApiPropertyOptional()
  latePenaltyRate?: number;

  @Expose()
  @ApiPropertyOptional()
  latePenaltyAmount?: number;

  @Expose()
  @ApiPropertyOptional()
  latePaymentCount?: number;

  @Expose()
  @ApiPropertyOptional()
  missedPaymentCount?: number;

  @Expose()
  @ApiPropertyOptional()
  riskRating?: string;

  @Expose()
  @ApiPropertyOptional()
  creditScoreAtDisbursement?: number;

  @Expose()
  @ApiPropertyOptional()
  debtToIncomeRatio?: number;

  @Expose()
  @ApiPropertyOptional()
  collateralCoverageRatio?: number;

  @Expose()
  @ApiPropertyOptional()
  totalCollateralValue?: number;

  @Expose()
  @ApiPropertyOptional()
  loanToValueRatio?: number;

  @Expose()
  @ApiPropertyOptional()
  tags?: string[];

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  internalNotes?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional()
  version?: number;

  @Expose()
  @ApiProperty({ type: UserBasicInfoDto })
  @Type(() => UserBasicInfoDto)
  borrower: UserBasicInfoDto;

  @Expose()
  @ApiPropertyOptional({ type: [LoanDocumentResponseDto] })
  @Type(() => LoanDocumentResponseDto)
  documents?: LoanDocumentResponseDto[];

  @Expose()
  @ApiPropertyOptional({ type: [CollateralResponseDto] })
  @Type(() => CollateralResponseDto)
  collaterals?: CollateralResponseDto[];

  @Expose()
  @ApiProperty({ type: [RepaymentScheduleItemDto] })
  @Type(() => RepaymentScheduleItemDto)
  repaymentSchedule: RepaymentScheduleItemDto[];

  // Computed properties from entity
  @Expose()
  @ApiProperty()
  get progressPercentage(): number {
    return this.amount ? (this.amountPaid / this.amount) * 100 : 0;
  }

  @Expose()
  @ApiPropertyOptional()
  get remainingMonths(): number | null {
    if (!this.tenureMonths || !this.createdAt) return null;
    const startDate = this.disbursementDate || this.createdAt;
    const elapsedMonths = this.getMonthDifference(new Date(), startDate);
    return Math.max(0, this.tenureMonths - elapsedMonths);
  }

  @Expose()
  @ApiProperty()
  get isActive(): boolean {
    return this.status === LoanStatus.ACTIVE;
  }

  @Expose()
  @ApiProperty()
  get isCompleted(): boolean {
    return this.status === LoanStatus.COMPLETED;
  }

  @Expose()
  @ApiProperty()
  get isDefaulted(): boolean {
    return this.status === LoanStatus.DEFAULTED;
  }

  @Expose()
  @ApiProperty()
  get isApproved(): boolean {
    return this.status === LoanStatus.APPROVED;
  }

  @Expose()
  @ApiProperty()
  get isFunded(): boolean {
    return this.status === LoanStatus.FUNDING || this.status === LoanStatus.ACTIVE;
  }

  @Expose()
  @ApiPropertyOptional()
  get daysSinceDisbursement(): number | null {
    if (!this.disbursementDate) return null;
    const today = new Date();
    const disbursement = new Date(this.disbursementDate);
    const diffTime = today.getTime() - disbursement.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @Expose()
  @ApiPropertyOptional()
  get daysUntilMaturity(): number | null {
    if (!this.lastRepaymentDate) return null;
    const today = new Date();
    const maturity = new Date(this.lastRepaymentDate);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @Expose()
  @ApiProperty()
  get totalRepayment(): number {
    return this.amount + (this.totalInterest || 0) + (this.totalFees || 0);
  }

  @Expose()
  @ApiProperty()
  get fundingProgress(): number {
    return this.amount > 0 ? ((this.amount - this.outstandingBalance) / this.amount) * 100 : 0;
  }

  @Expose()
  @ApiProperty()
  get isFullyFunded(): boolean {
    return this.outstandingBalance <= 0;
  }

  @Expose()
  @ApiProperty()
  get canBeFunded(): boolean {
    return this.status === LoanStatus.APPROVED && !this.isFullyFunded;
  }

  @Expose()
  @ApiProperty()
  get paymentsMade(): number {
    // This would need to be calculated from repayments if available
    return 0;
  }

  @Expose()
  @ApiProperty()
  get paymentsRemaining(): number {
    return this.tenureMonths - this.paymentsMade;
  }

  @Expose()
  @ApiProperty()
  get daysPastDue(): number {
    // This would need to be calculated from repayments if available
    return 0;
  }

  @Expose()
  @ApiProperty()
  get isOverdue(): boolean {
    return this.daysPastDue > 0;
  }

  private getMonthDifference(date1: Date, date2: Date): number {
    const years = date1.getFullYear() - date2.getFullYear();
    const months = date1.getMonth() - date2.getMonth();
    return years * 12 + months;
  }
}