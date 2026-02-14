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
exports.ComplianceCheck = exports.ComplianceCheckResult = exports.ComplianceCheckStatus = exports.ComplianceCheckType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
var ComplianceCheckType;
(function (ComplianceCheckType) {
    ComplianceCheckType["IDENTITY"] = "identity";
    ComplianceCheckType["ADDRESS"] = "address";
    ComplianceCheckType["SANCTIONS"] = "sanctions";
    ComplianceCheckType["PEP"] = "pep";
    ComplianceCheckType["ADVERSE_MEDIA"] = "adverse_media";
    ComplianceCheckType["AML"] = "aml";
    ComplianceCheckType["CREDIT"] = "credit";
    ComplianceCheckType["BANK_ACCOUNT"] = "bank_account";
})(ComplianceCheckType || (exports.ComplianceCheckType = ComplianceCheckType = {}));
var ComplianceCheckStatus;
(function (ComplianceCheckStatus) {
    ComplianceCheckStatus["PENDING"] = "pending";
    ComplianceCheckStatus["IN_PROGRESS"] = "in_progress";
    ComplianceCheckStatus["COMPLETED"] = "completed";
    ComplianceCheckStatus["FAILED"] = "failed";
    ComplianceCheckStatus["SKIPPED"] = "skipped";
})(ComplianceCheckStatus || (exports.ComplianceCheckStatus = ComplianceCheckStatus = {}));
var ComplianceCheckResult;
(function (ComplianceCheckResult) {
    ComplianceCheckResult["PASS"] = "pass";
    ComplianceCheckResult["FAIL"] = "fail";
    ComplianceCheckResult["REVIEW"] = "review";
    ComplianceCheckResult["PENDING"] = "pending";
})(ComplianceCheckResult || (exports.ComplianceCheckResult = ComplianceCheckResult = {}));
let ComplianceCheck = class ComplianceCheck {
};
exports.ComplianceCheck = ComplianceCheck;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ComplianceCheck.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ComplianceCheckType,
    }),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "checkType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ComplianceCheckStatus,
        default: ComplianceCheckStatus.PENDING,
    }),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ComplianceCheckResult,
        nullable: true,
    }),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], ComplianceCheck.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], ComplianceCheck.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ComplianceCheck.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ComplianceCheck.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComplianceCheck.prototype, "createdAt", void 0);
exports.ComplianceCheck = ComplianceCheck = __decorate([
    (0, typeorm_1.Entity)('compliance_checks')
], ComplianceCheck);
//# sourceMappingURL=compliance-check.entity.js.map