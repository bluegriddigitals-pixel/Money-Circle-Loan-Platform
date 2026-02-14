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
exports.RiskFactor = void 0;
const typeorm_1 = require("typeorm");
const risk_assessment_entity_1 = require("./risk-assessment.entity");
let RiskFactor = class RiskFactor {
};
exports.RiskFactor = RiskFactor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiskFactor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => risk_assessment_entity_1.RiskAssessment, assessment => assessment.riskFactors, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assessmentId' }),
    __metadata("design:type", risk_assessment_entity_1.RiskAssessment)
], RiskFactor.prototype, "assessment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiskFactor.prototype, "assessmentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiskFactor.prototype, "factorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RiskFactor.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RiskFactor.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskFactor.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RiskFactor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RiskFactor.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], RiskFactor.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RiskFactor.prototype, "createdAt", void 0);
exports.RiskFactor = RiskFactor = __decorate([
    (0, typeorm_1.Entity)('risk_factors')
], RiskFactor);
//# sourceMappingURL=risk-factor.entity.js.map