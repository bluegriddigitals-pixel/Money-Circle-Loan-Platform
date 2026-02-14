export enum EscrowAccountStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
  PENDING = 'pending',
}

export enum EscrowAccountType {
  LOAN = 'loan',
  INTEREST = 'interest',
  FEE = 'fee',
  COLLATERAL = 'collateral',
  RESERVE = 'reserve',
}

export enum EscrowTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FEE = 'fee',
  INTEREST = 'interest',
}