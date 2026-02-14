export enum PayoutRequestType {
  LOAN_DISBURSEMENT = 'loan_disbursement',
  INTEREST_PAYOUT = 'interest_payout',
  FEE_PAYOUT = 'fee_payout',
  INVESTOR_RETURN = 'investor_return',
  REFUND = 'refund',
  OTHER = 'other',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO = 'crypto',
  CASH = 'cash',
}

export enum PayoutRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PayoutPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}