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
exports.AccessLog = exports.AccessSeverity = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var AccessSeverity;
(function (AccessSeverity) {
    AccessSeverity["LOW"] = "LOW";
    AccessSeverity["MEDIUM"] = "MEDIUM";
    AccessSeverity["HIGH"] = "HIGH";
    AccessSeverity["CRITICAL"] = "CRITICAL";
})(AccessSeverity || (exports.AccessSeverity = AccessSeverity = {}));
let AccessLog = class AccessLog {
};
exports.AccessLog = AccessLog;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the access log',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AccessLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User ID who attempted access',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AccessLog.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action attempted',
        example: 'LOGIN_FAILED',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessLog.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action details',
        example: 'Failed login attempt: Invalid credentials',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessLog.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IP address of the client',
        example: '192.168.1.1',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessLog.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User agent of the client',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessLog.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Severity level',
        enum: AccessSeverity,
        example: AccessSeverity.HIGH,
        default: AccessSeverity.MEDIUM,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccessSeverity,
        default: AccessSeverity.MEDIUM,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(AccessSeverity),
    __metadata("design:type", String)
], AccessLog.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { attemptCount: 3, lockoutTime: '2024-01-01T00:00:00Z' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AccessLog.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the access attempt occurred',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AccessLog.prototype, "timestamp", void 0);
exports.AccessLog = AccessLog = __decorate([
    (0, typeorm_1.Entity)('access_logs'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['action']),
    (0, typeorm_1.Index)(['ipAddress']),
    (0, typeorm_1.Index)(['timestamp'])
], AccessLog);
//# sourceMappingURL=access-log.entity.js.map