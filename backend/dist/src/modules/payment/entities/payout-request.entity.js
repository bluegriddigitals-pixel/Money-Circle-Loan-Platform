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
exports.PayoutRequest = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const escrow_account_entity_1 = require("./escrow-account.entity");
const transaction_entity_1 = require("./transaction.entity");
const payout_enum_1 = require("../enums/payout.enum");
let PayoutRequest = class PayoutRequest {
};
exports.PayoutRequest = PayoutRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayoutRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "requestNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], PayoutRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayoutRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => escrow_account_entity_1.EscrowAccount, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'escrowAccountId' }),
    __metadata("design:type", escrow_account_entity_1.EscrowAccount)
], PayoutRequest.prototype, "escrowAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "escrowAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payout_enum_1.PayoutRequestType,
    }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PayoutRequest.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payout_enum_1.PayoutMethod,
    }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "payoutMethod", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayoutRequest.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "recipientEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "recipientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], PayoutRequest.prototype, "paymentDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "internalReference", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], PayoutRequest.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], PayoutRequest.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payout_enum_1.PayoutRequestStatus,
        default: payout_enum_1.PayoutRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payout_enum_1.PayoutPriority,
        default: payout_enum_1.PayoutPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "approvalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, transaction => transaction.payoutRequest),
    __metadata("design:type", Array)
], PayoutRequest.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "expectedSettlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutRequest.prototype, "actualSettlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'USD' }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayoutRequest.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayoutRequest.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutRequest.prototype, "receiptUrl", void 0);
exports.PayoutRequest = PayoutRequest = __decorate([
    (0, typeorm_1.Entity)('payout_requests')
], PayoutRequest);
//# sourceMappingURL=payout-request.entity.js.map