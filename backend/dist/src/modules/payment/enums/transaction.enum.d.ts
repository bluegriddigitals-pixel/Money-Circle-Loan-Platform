export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    TRANSFER = "TRANSFER",
    LOAN_PAYMENT = "LOAN_PAYMENT",
    LOAN_DISBURSEMENT = "LOAN_DISBURSEMENT",
    ESCROW_DEPOSIT = "ESCROW_DEPOSIT",
    ESCROW_RELEASE = "ESCROW_RELEASE",
    FEE = "FEE",
    REFUND = "REFUND"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethodType {
    BANK_TRANSFER = "BANK_TRANSFER",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    MOBILE_MONEY = "MOBILE_MONEY",
    PAYPAL = "PAYPAL",
    ESCROW = "ESCROW"
}
export declare enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    ZAR = "ZAR",
    KES = "KES",
    GHS = "GHS",
    NGN = "NGN"
}
