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
exports.AmlAlert = exports.AmlAlertType = exports.AmlAlertSeverity = exports.AmlAlertStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
var AmlAlertStatus;
(function (AmlAlertStatus) {
    AmlAlertStatus["PENDING"] = "pending";
    AmlAlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AmlAlertStatus["IN_REVIEW"] = "in_review";
    AmlAlertStatus["RESOLVED"] = "resolved";
    AmlAlertStatus["ESCALATED"] = "escalated";
    AmlAlertStatus["CLOSED"] = "closed";
    AmlAlertStatus["FALSE_POSITIVE"] = "false_positive";
})(AmlAlertStatus || (exports.AmlAlertStatus = AmlAlertStatus = {}));
var AmlAlertSeverity;
(function (AmlAlertSeverity) {
    AmlAlertSeverity["LOW"] = "low";
    AmlAlertSeverity["MEDIUM"] = "medium";
    AmlAlertSeverity["HIGH"] = "high";
    AmlAlertSeverity["CRITICAL"] = "critical";
})(AmlAlertSeverity || (exports.AmlAlertSeverity = AmlAlertSeverity = {}));
var AmlAlertType;
(function (AmlAlertType) {
    AmlAlertType["TRANSACTION"] = "transaction";
    AmlAlertType["BEHAVIORAL"] = "behavioral";
    AmlAlertType["SANCTIONS"] = "sanctions";
    AmlAlertType["PEP"] = "pep";
    AmlAlertType["ADVERSE_MEDIA"] = "adverse_media";
    AmlAlertType["VELOCITY"] = "velocity";
    AmlAlertType["GEO_LOCATION"] = "geo_location";
    AmlAlertType["STRUCTURING"] = "structuring";
})(AmlAlertType || (exports.AmlAlertType = AmlAlertType = {}));
let AmlAlert = class AmlAlert {
};
exports.AmlAlert = AmlAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AmlAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], AmlAlert.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AmlAlert.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AmlAlertType,
    }),
    __metadata("design:type", String)
], AmlAlert.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AmlAlertSeverity,
    }),
    __metadata("design:type", String)
], AmlAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AmlAlertStatus,
        default: AmlAlertStatus.PENDING,
    }),
    __metadata("design:type", String)
], AmlAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], AmlAlert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], AmlAlert.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AmlAlert.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AmlAlert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "escalatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AmlAlert.prototype, "escalatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "escalationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmlAlert.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AmlAlert.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AmlAlert.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AmlAlert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AmlAlert.prototype, "updatedAt", void 0);
exports.AmlAlert = AmlAlert = __decorate([
    (0, typeorm_1.Entity)('aml_alerts')
], AmlAlert);
//# sourceMappingURL=aml-alert.entity.js.map