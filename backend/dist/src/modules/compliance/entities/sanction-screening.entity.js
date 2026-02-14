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
exports.SanctionScreening = exports.RiskLevel = exports.SanctionMatchStatus = exports.SanctionScreeningStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
var SanctionScreeningStatus;
(function (SanctionScreeningStatus) {
    SanctionScreeningStatus["PENDING"] = "pending";
    SanctionScreeningStatus["IN_PROGRESS"] = "in_progress";
    SanctionScreeningStatus["COMPLETED"] = "completed";
    SanctionScreeningStatus["FAILED"] = "failed";
})(SanctionScreeningStatus || (exports.SanctionScreeningStatus = SanctionScreeningStatus = {}));
var SanctionMatchStatus;
(function (SanctionMatchStatus) {
    SanctionMatchStatus["NO_MATCH"] = "no_match";
    SanctionMatchStatus["POTENTIAL_MATCH"] = "potential_match";
    SanctionMatchStatus["CONFIRMED_MATCH"] = "confirmed_match";
    SanctionMatchStatus["FALSE_POSITIVE"] = "false_positive";
})(SanctionMatchStatus || (exports.SanctionMatchStatus = SanctionMatchStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
let SanctionScreening = class SanctionScreening {
};
exports.SanctionScreening = SanctionScreening;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SanctionScreening.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], SanctionScreening.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SanctionScreening.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SanctionScreeningStatus,
        default: SanctionScreeningStatus.PENDING,
    }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SanctionMatchStatus,
        default: SanctionMatchStatus.NO_MATCH,
    }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "matchStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RiskLevel,
        default: RiskLevel.LOW,
    }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], SanctionScreening.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], SanctionScreening.prototype, "requestData", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], SanctionScreening.prototype, "responseData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SanctionScreening.prototype, "screenedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SanctionScreening.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SanctionScreening.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SanctionScreening.prototype, "reviewNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SanctionScreening.prototype, "createdAt", void 0);
exports.SanctionScreening = SanctionScreening = __decorate([
    (0, typeorm_1.Entity)('sanction_screenings')
], SanctionScreening);
//# sourceMappingURL=sanction-screening.entity.js.map