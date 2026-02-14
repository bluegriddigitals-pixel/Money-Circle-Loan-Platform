"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowAccount = void 0;
const typeorm_1 = require("typeorm");
const loan_entity_1 = require("../../loan/entities/loan.entity");
const transaction_entity_1 = require("./transaction.entity");
const escrow_enum_1 = require("../enums/escrow.enum");
let EscrowAccount = class EscrowAccount {
};
exports.EscrowAccount = EscrowAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EscrowAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], EscrowAccount.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EscrowAccount.prototype, "loanId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: escrow_enum_1.EscrowAccountType,
        default: escrow_enum_1.EscrowAccountType.LOAN
    }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EscrowAccount.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EscrowAccount.prototype, "availableBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EscrowAccount.prototype, "maximumBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EscrowAccount.prototype, "minimumBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: escrow_enum_1.EscrowAccountStatus,
        default: escrow_enum_1.EscrowAccountStatus.PENDING,
    }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "frozenReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "closedReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], EscrowAccount.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], EscrowAccount.prototype, "releasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowAccount.prototype, "releasedTo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, transaction => transaction.escrowAccount),
    __metadata("design:type", Array)
], EscrowAccount.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EscrowAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EscrowAccount.prototype, "updatedAt", void 0);
exports.EscrowAccount = EscrowAccount = __decorate([
    (0, typeorm_1.Entity)('escrow_accounts')
], EscrowAccount);
//# sourceMappingURL=escrow-account.entity.js.map