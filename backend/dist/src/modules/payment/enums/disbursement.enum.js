"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisbursementStatus = exports.DisbursementMethod = exports.DisbursementType = void 0;
var DisbursementType;
(function (DisbursementType) {
    DisbursementType["LOAN_DISBURSEMENT"] = "LOAN_DISBURSEMENT";
    DisbursementType["PARTIAL_DISBURSEMENT"] = "PARTIAL_DISBURSEMENT";
    DisbursementType["INTERIM_DISBURSEMENT"] = "INTERIM_DISBURSEMENT";
    DisbursementType["FINAL_DISBURSEMENT"] = "FINAL_DISBURSEMENT";
    DisbursementType["REFUND_DISBURSEMENT"] = "REFUND_DISBURSEMENT";
})(DisbursementType || (exports.DisbursementType = DisbursementType = {}));
var DisbursementMethod;
(function (DisbursementMethod) {
    DisbursementMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    DisbursementMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
    DisbursementMethod["CHECK"] = "CHECK";
    DisbursementMethod["DIRECT_DEPOSIT"] = "DIRECT_DEPOSIT";
    DisbursementMethod["CASH"] = "CASH";
    DisbursementMethod["WIRE_TRANSFER"] = "WIRE_TRANSFER";
    DisbursementMethod["ACH"] = "ACH";
})(DisbursementMethod || (exports.DisbursementMethod = DisbursementMethod = {}));
var DisbursementStatus;
(function (DisbursementStatus) {
    DisbursementStatus["PENDING"] = "PENDING";
    DisbursementStatus["APPROVED"] = "APPROVED";
    DisbursementStatus["SCHEDULED"] = "SCHEDULED";
    DisbursementStatus["PROCESSING"] = "PROCESSING";
    DisbursementStatus["PARTIAL"] = "PARTIAL";
    DisbursementStatus["COMPLETED"] = "COMPLETED";
    DisbursementStatus["FAILED"] = "FAILED";
    DisbursementStatus["CANCELLED"] = "CANCELLED";
    DisbursementStatus["REJECTED"] = "REJECTED";
})(DisbursementStatus || (exports.DisbursementStatus = DisbursementStatus = {}));
//# sourceMappingURL=disbursement.enum.js.map