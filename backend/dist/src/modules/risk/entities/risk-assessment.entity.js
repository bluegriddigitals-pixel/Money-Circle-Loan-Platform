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
exports.RiskAssessment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const loan_entity_1 = require("../../loan/entities/loan.entity");
const risk_factor_entity_1 = require("./risk-factor.entity");
let RiskAssessment = class RiskAssessment {
};
exports.RiskAssessment = RiskAssessment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiskAssessment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], RiskAssessment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiskAssessment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], RiskAssessment.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskAssessment.prototype, "loanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RiskAssessment.prototype, "creditScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RiskAssessment.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskAssessment.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], RiskAssessment.prototype, "assessmentData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskAssessment.prototype, "assessedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RiskAssessment.prototype, "assessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskAssessment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => risk_factor_entity_1.RiskFactor, riskFactor => riskFactor.assessment, { cascade: true }),
    __metadata("design:type", Array)
], RiskAssessment.prototype, "riskFactors", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RiskAssessment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RiskAssessment.prototype, "updatedAt", void 0);
exports.RiskAssessment = RiskAssessment = __decorate([
    (0, typeorm_1.Entity)('risk_assessments')
], RiskAssessment);
//# sourceMappingURL=risk-assessment.entity.js.map