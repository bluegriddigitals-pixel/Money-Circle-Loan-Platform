// payment-method.enum.ts
export enum PaymentMethodStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash',
}

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  JCB = 'jcb',
  UNIONPAY = 'unionpay',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  BUSINESS = 'business',
}