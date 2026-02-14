"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowTransactionType = exports.EscrowAccountType = exports.EscrowAccountStatus = void 0;
var EscrowAccountStatus;
(function (EscrowAccountStatus) {
    EscrowAccountStatus["ACTIVE"] = "active";
    EscrowAccountStatus["FROZEN"] = "frozen";
    EscrowAccountStatus["CLOSED"] = "closed";
    EscrowAccountStatus["PENDING"] = "pending";
})(EscrowAccountStatus || (exports.EscrowAccountStatus = EscrowAccountStatus = {}));
var EscrowAccountType;
(function (EscrowAccountType) {
    EscrowAccountType["LOAN"] = "loan";
    EscrowAccountType["INTEREST"] = "interest";
    EscrowAccountType["FEE"] = "fee";
    EscrowAccountType["COLLATERAL"] = "collateral";
    EscrowAccountType["RESERVE"] = "reserve";
})(EscrowAccountType || (exports.EscrowAccountType = EscrowAccountType = {}));
var EscrowTransactionType;
(function (EscrowTransactionType) {
    EscrowTransactionType["DEPOSIT"] = "deposit";
    EscrowTransactionType["WITHDRAWAL"] = "withdrawal";
    EscrowTransactionType["TRANSFER"] = "transfer";
    EscrowTransactionType["FEE"] = "fee";
    EscrowTransactionType["INTEREST"] = "interest";
})(EscrowTransactionType || (exports.EscrowTransactionType = EscrowTransactionType = {}));
//# sourceMappingURL=escrow.enum.js.map