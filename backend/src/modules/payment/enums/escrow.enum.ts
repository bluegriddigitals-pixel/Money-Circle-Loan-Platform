export enum EscrowAccountStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  FROZEN = 'frozen',
}

export enum EscrowAccountType {
  LOAN_DISBURSEMENT = 'loan_disbursement',
  LOAN_REPAYMENT = 'loan_repayment',
  COLLATERAL = 'collateral',
  TAX_HOLDING = 'tax_holding',
  FEES_HOLDING = 'fees_holding',
  GENERAL = 'general',
}