// src/modules/payment/enums/escrow.enum.ts

export enum EscrowAccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

export enum EscrowAccountType {
  STANDARD = 'standard',
  LOAN_DISBURSEMENT = 'loan_disbursement',
  LOAN_REPAYMENT = 'loan_repayment',
  INVESTMENT = 'investment',
  RESERVE = 'reserve',
  FEES = 'fees',
}

// You can also add more specific types based on your business needs