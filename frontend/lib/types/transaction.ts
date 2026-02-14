import { TransactionType, TransactionStatus } from '../constants/enums';

export interface Transaction {
  id: string;
  transactionReference: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description?: string;
  loanId?: string;
  repaymentScheduleId?: string;
  investmentId?: string;
  gatewayReference?: string;
  gatewayName?: string;
  gatewayResponse?: any;
  processingFee: number;
  gatewayFee: number;
  netAmount: number;
  initiatedAt: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}