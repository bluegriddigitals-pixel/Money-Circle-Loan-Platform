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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const access_log_entity_1 = require("./entities/access-log.entity");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getAuditLogs(userId, action, severity, startDate, endDate, limit, offset) {
        return this.auditService.getAuditLogs({
            userId,
            action,
            severity,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit,
            offset,
        });
    }
    async getAccessLogs(userId, action, ipAddress, severity, startDate, endDate, limit, offset) {
        return this.auditService.getAccessLogs({
            userId,
            action,
            ipAddress,
            severity,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit,
            offset,
        });
    }
    async getUserAuditLogs(userId, limit, offset) {
        return this.auditService.getUserAuditLogs(userId, limit, offset);
    }
    async getAccessLogsByIp(ipAddress, limit, offset) {
        return this.auditService.getAccessLogsByIp(ipAddress, limit, offset);
    }
    async getAuditLogById(id) {
        return this.auditService.getAuditLogById(id);
    }
    async getAccessLogById(id) {
        return this.auditService.getAccessLogById(id);
    }
    async getAuditStatistics(timeframe) {
        return this.auditService.getAuditStatistics(timeframe);
    }
    async getUserAuditSummary(userId) {
        const [auditLogs, accessLogs] = await Promise.all([
            this.auditService.getUserAuditLogs(userId, 1, 0),
            this.auditService.getAccessLogs({ userId, limit: 1 }),
        ]);
        const severityBreakdown = await this.auditService['auditLogRepository']
            .createQueryBuilder('log')
            .select('log.severity', 'severity')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.userId = :userId', { userId })
            .groupBy('log.severity')
            .getRawMany();
        return {
            totalAudits: await this.auditService['auditLogRepository'].count({ where: { userId } }),
            totalAccesses: await this.auditService['accessLogRepository'].count({ where: { userId } }),
            lastActivity: auditLogs[0]?.timestamp || accessLogs.items[0]?.timestamp || null,
            severityBreakdown,
        };
    }
    async healthCheck() {
        await this.auditService.getAuditLogs({ limit: 1 });
        return {
            status: 'healthy',
            timestamp: new Date(),
        };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs with filters' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return audit logs' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'severity', enum: audit_log_entity_1.AuditSeverity, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(6, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('access'),
    (0, swagger_1.ApiOperation)({ summary: 'Get access logs with filters' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return access logs' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'ipAddress', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'severity', enum: access_log_entity_1.AccessSeverity, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('ipAddress')),
    __param(3, (0, common_1.Query)('severity')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(7, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAccessLogs", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs by user ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return user audit logs' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserAuditLogs", null);
__decorate([
    (0, common_1.Get)('ip/:ipAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get access logs by IP address' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return IP access logs' }),
    (0, swagger_1.ApiParam)({ name: 'ipAddress', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Param)('ipAddress')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAccessLogsByIp", null);
__decorate([
    (0, common_1.Get)('logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return audit log' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Audit log not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogById", null);
__decorate([
    (0, common_1.Get)('access/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get access log by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return access log' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Access log not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAccessLogById", null);
__decorate([
    (0, common_1.Get)('statistics/:timeframe'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit statistics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return audit statistics' }),
    (0, swagger_1.ApiParam)({ name: 'timeframe', enum: ['day', 'week', 'month', 'year'] }),
    __param(0, (0, common_1.Param)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditStatistics", null);
__decorate([
    (0, common_1.Get)('summary/user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit summary for a specific user' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return user audit summary' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserAuditSummary", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check audit service health' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Audit service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "healthCheck", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('audit'),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map