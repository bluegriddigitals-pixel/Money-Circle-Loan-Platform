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
exports.Kyc = exports.KycStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const kyc_document_entity_1 = require("./kyc-document.entity");
var KycStatus;
(function (KycStatus) {
    KycStatus["INITIATED"] = "initiated";
    KycStatus["SUBMITTED"] = "submitted";
    KycStatus["APPROVED"] = "approved";
    KycStatus["REJECTED"] = "rejected";
    KycStatus["RETURNED"] = "returned";
    KycStatus["EXPIRED"] = "expired";
    KycStatus["NOT_STARTED"] = "not_started";
    KycStatus["IN_PROGRESS"] = "in_progress";
    KycStatus["VERIFIED"] = "verified";
    KycStatus["PENDING"] = "pending";
    KycStatus["REVIEW"] = "review";
    KycStatus["ESCALATED"] = "escalated";
    KycStatus["RESOLVED"] = "resolved";
    KycStatus["CLOSED"] = "closed";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
let Kyc = class Kyc {
};
exports.Kyc = Kyc;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Kyc.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Kyc.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Kyc.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: KycStatus,
        default: KycStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], Kyc.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Kyc.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Kyc.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Kyc.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Kyc.prototype, "reviewNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Kyc.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Kyc.prototype, "returnReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Kyc.prototype, "expiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Kyc.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => kyc_document_entity_1.KycDocument, document => document.kyc, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Kyc.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Kyc.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Kyc.prototype, "updatedAt", void 0);
exports.Kyc = Kyc = __decorate([
    (0, typeorm_1.Entity)('kyc')
], Kyc);
//# sourceMappingURL=kyc.entity.js.map