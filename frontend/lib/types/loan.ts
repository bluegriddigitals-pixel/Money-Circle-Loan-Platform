import { 
  LoanStatus, 
  LoanApplicationStatus, 
  RepaymentStatus, 
  RiskLevel 
} from '../constants/enums';

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  interestRate: number;
  interestType: string;
  calculationMethod: string;
  processingFeePercent: number;
  processingFeeFixed: number;
  lateFeePercent: number;
  lateFeeFixed: number;
  earlyRepaymentFeePercent: number;
  minCreditScore: number;
  minMonthlyIncome: number;
  allowedEmploymentStatus: string[];
  minAge: number;
  maxAge: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  userId: string;
  loanProductId?: string;
  amount: number;
  tenureMonths: number;
  purpose?: string;
  status: LoanApplicationStatus;
  currentStage: string;
  assignedAuditorId?: string;
  approvedAmount?: number;
  approvedTenureMonths?: number;
  approvedInterestRate?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskNotes?: string;
  submittedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  loanApplicationId?: string;
  borrowerId: string;
  loanProductId: string;
  principalAmount: number;
  tenureMonths: number;
  interestRate: number;
  interestType: string;
  calculationMethod: string;
  totalInterest: number;
  totalAmount: number;
  processingFee: number;
  disbursementFee: number;
  insuranceFee: number;
  status: LoanStatus;
  currentBalance: number;
  amountPaid: number;
  amountDue: number;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  firstRepaymentDate?: string;
  lastRepaymentDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  isFullyFunded: boolean;
  fundingProgress: number;
  fundingDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepaymentSchedule {
  id: string;
  loanId: string;
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  dueDate: string;
  gracePeriodDays: number;
  status: RepaymentStatus;
  paidAmount: number;
  paidDate?: string;
  lateFee: number;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanInvestment {
  id: string;
  loanId: string;
  lenderId: string;
  amount: number;
  percentageOwned: number;
  expectedInterest: number;
  earnedInterest: number;
  expectedTotalReturn: number;
  status: string;
  investmentDate: string;
  maturityDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanGuarantor {
  id: string;
  loanId: string;
  userId: string;
  guaranteeAmount: number;
  guaranteePercentage: number;
  relationshipToBorrower?: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}