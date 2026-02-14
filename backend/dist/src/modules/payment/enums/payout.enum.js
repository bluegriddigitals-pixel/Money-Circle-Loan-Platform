"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutPriority = exports.PayoutRequestStatus = exports.PayoutMethod = exports.PayoutRequestType = void 0;
var PayoutRequestType;
(function (PayoutRequestType) {
    PayoutRequestType["LOAN_DISBURSEMENT"] = "loan_disbursement";
    PayoutRequestType["INTEREST_PAYOUT"] = "interest_payout";
    PayoutRequestType["FEE_PAYOUT"] = "fee_payout";
    PayoutRequestType["INVESTOR_RETURN"] = "investor_return";
    PayoutRequestType["REFUND"] = "refund";
    PayoutRequestType["OTHER"] = "other";
})(PayoutRequestType || (exports.PayoutRequestType = PayoutRequestType = {}));
var PayoutMethod;
(function (PayoutMethod) {
    PayoutMethod["BANK_TRANSFER"] = "bank_transfer";
    PayoutMethod["WIRE_TRANSFER"] = "wire_transfer";
    PayoutMethod["CHECK"] = "check";
    PayoutMethod["DIGITAL_WALLET"] = "digital_wallet";
    PayoutMethod["CRYPTO"] = "crypto";
    PayoutMethod["CASH"] = "cash";
})(PayoutMethod || (exports.PayoutMethod = PayoutMethod = {}));
var PayoutRequestStatus;
(function (PayoutRequestStatus) {
    PayoutRequestStatus["PENDING"] = "pending";
    PayoutRequestStatus["PROCESSING"] = "processing";
    PayoutRequestStatus["APPROVED"] = "approved";
    PayoutRequestStatus["COMPLETED"] = "completed";
    PayoutRequestStatus["REJECTED"] = "rejected";
    PayoutRequestStatus["CANCELLED"] = "cancelled";
    PayoutRequestStatus["FAILED"] = "failed";
})(PayoutRequestStatus || (exports.PayoutRequestStatus = PayoutRequestStatus = {}));
var PayoutPriority;
(function (PayoutPriority) {
    PayoutPriority["LOW"] = "low";
    PayoutPriority["MEDIUM"] = "medium";
    PayoutPriority["HIGH"] = "high";
    PayoutPriority["URGENT"] = "urgent";
})(PayoutPriority || (exports.PayoutPriority = PayoutPriority = {}));
//# sourceMappingURL=payout.enum.js.map