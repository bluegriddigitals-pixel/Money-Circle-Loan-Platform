"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.CardType = exports.PaymentMethodType = exports.PaymentMethodStatus = void 0;
var PaymentMethodStatus;
(function (PaymentMethodStatus) {
    PaymentMethodStatus["PENDING"] = "pending";
    PaymentMethodStatus["ACTIVE"] = "active";
    PaymentMethodStatus["INACTIVE"] = "inactive";
    PaymentMethodStatus["VERIFIED"] = "verified";
    PaymentMethodStatus["EXPIRED"] = "expired";
    PaymentMethodStatus["FAILED"] = "failed";
})(PaymentMethodStatus || (exports.PaymentMethodStatus = PaymentMethodStatus = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["CREDIT_CARD"] = "credit_card";
    PaymentMethodType["DEBIT_CARD"] = "debit_card";
    PaymentMethodType["BANK_ACCOUNT"] = "bank_account";
    PaymentMethodType["DIGITAL_WALLET"] = "digital_wallet";
    PaymentMethodType["CASH"] = "cash";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
var CardType;
(function (CardType) {
    CardType["VISA"] = "visa";
    CardType["MASTERCARD"] = "mastercard";
    CardType["AMEX"] = "amex";
    CardType["DISCOVER"] = "discover";
    CardType["JCB"] = "jcb";
    CardType["UNIONPAY"] = "unionpay";
})(CardType || (exports.CardType = CardType = {}));
var AccountType;
(function (AccountType) {
    AccountType["CHECKING"] = "checking";
    AccountType["SAVINGS"] = "savings";
    AccountType["BUSINESS"] = "business";
})(AccountType || (exports.AccountType = AccountType = {}));
//# sourceMappingURL=payment-method.enum.js.map