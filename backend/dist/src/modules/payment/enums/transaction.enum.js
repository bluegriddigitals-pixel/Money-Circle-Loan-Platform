"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = exports.PaymentMethodType = exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["LOAN_PAYMENT"] = "LOAN_PAYMENT";
    TransactionType["LOAN_DISBURSEMENT"] = "LOAN_DISBURSEMENT";
    TransactionType["ESCROW_DEPOSIT"] = "ESCROW_DEPOSIT";
    TransactionType["ESCROW_RELEASE"] = "ESCROW_RELEASE";
    TransactionType["FEE"] = "FEE";
    TransactionType["REFUND"] = "REFUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodType["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethodType["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethodType["MOBILE_MONEY"] = "MOBILE_MONEY";
    PaymentMethodType["PAYPAL"] = "PAYPAL";
    PaymentMethodType["ESCROW"] = "ESCROW";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
    Currency["ZAR"] = "ZAR";
    Currency["KES"] = "KES";
    Currency["GHS"] = "GHS";
    Currency["NGN"] = "NGN";
})(Currency || (exports.Currency = Currency = {}));
//# sourceMappingURL=transaction.enum.js.map