export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CRYPTO = 'crypto',
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  FRAUDULENT = 'fraudulent',
}

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  DINERS_CLUB = 'diners_club',
  JCB = 'jcb',
  UNIONPAY = 'unionpay',
  OTHER = 'other',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  MONEY_MARKET = 'money_market',
  BUSINESS_CHECKING = 'business_checking',
  BUSINESS_SAVINGS = 'business_savings',
}