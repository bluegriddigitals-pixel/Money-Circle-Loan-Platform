export enum PayoutRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum PayoutRequestType {
  LOAN_DISBURSEMENT = 'loan_disbursement',
  REFUND = 'refund',
  COMMISSION = 'commission',
  DIVIDEND = 'dividend',
  WITHDRAWAL = 'withdrawal',
  SETTLEMENT = 'settlement',
  OTHER = 'other',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash',
  CRYPTO = 'crypto',
  WIRE_TRANSFER = 'wire_transfer',
}