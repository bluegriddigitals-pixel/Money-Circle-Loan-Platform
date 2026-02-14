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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const access_log_entity_1 = require("./entities/access-log.entity");
let AuditService = AuditService_1 = class AuditService {
    constructor(auditLogRepository, accessLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.accessLogRepository = accessLogRepository;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async logAudit(userId, action, details, request, severity = audit_log_entity_1.AuditSeverity.LOW, metadata) {
        try {
            const ipAddress = this.getClientIp(request);
            const userAgent = this.getUserAgent(request);
            const auditLog = this.auditLogRepository.create({
                userId: userId || null,
                action,
                details,
                ipAddress,
                userAgent,
                severity,
                metadata,
                timestamp: new Date(),
            });
            const saved = await this.auditLogRepository.save(auditLog);
            if (severity === audit_log_entity_1.AuditSeverity.HIGH || severity === audit_log_entity_1.AuditSeverity.CRITICAL) {
                this.logger.warn(`High severity audit: ${action} - ${details} - User: ${userId}`);
            }
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to log audit: ${error.message}`, error.stack);
            return null;
        }
    }
    async logAccess(userId, action, details, request, severity = access_log_entity_1.AccessSeverity.MEDIUM, metadata) {
        try {
            const ipAddress = this.getClientIp(request);
            const userAgent = this.getUserAgent(request);
            const accessLog = this.accessLogRepository.create({
                userId: userId || null,
                action,
                details,
                ipAddress,
                userAgent,
                severity,
                metadata,
                timestamp: new Date(),
            });
            const saved = await this.accessLogRepository.save(accessLog);
            if (severity === access_log_entity_1.AccessSeverity.HIGH || severity === access_log_entity_1.AccessSeverity.CRITICAL) {
                this.logger.warn(`High severity access: ${action} - ${details} - IP: ${ipAddress}`);
            }
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to log access: ${error.message}`, error.stack);
            return null;
        }
    }
    async getAuditLogs(filters) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.action)
            where.action = filters.action;
        if (filters.severity)
            where.severity = filters.severity;
        if (filters.startDate || filters.endDate) {
            where.timestamp = (0, typeorm_2.Between)(filters.startDate || new Date('1970-01-01'), filters.endDate || new Date());
        }
        const [items, total] = await this.auditLogRepository.findAndCount({
            where,
            order: { timestamp: 'DESC' },
            take: filters.limit || 50,
            skip: filters.offset || 0,
        });
        return { items, total };
    }
    async getAccessLogs(filters) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.action)
            where.action = filters.action;
        if (filters.ipAddress)
            where.ipAddress = filters.ipAddress;
        if (filters.severity)
            where.severity = filters.severity;
        if (filters.startDate || filters.endDate) {
            where.timestamp = (0, typeorm_2.Between)(filters.startDate || new Date('1970-01-01'), filters.endDate || new Date());
        }
        const [items, total] = await this.accessLogRepository.findAndCount({
            where,
            order: { timestamp: 'DESC' },
            take: filters.limit || 50,
            skip: filters.offset || 0,
        });
        return { items, total };
    }
    async getUserAuditLogs(userId, limit = 50, offset = 0) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getAccessLogsByIp(ipAddress, limit = 50, offset = 0) {
        return this.accessLogRepository.find({
            where: { ipAddress },
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getAuditLogById(id) {
        return this.auditLogRepository.findOne({
            where: { id },
        });
    }
    async getAccessLogById(id) {
        return this.accessLogRepository.findOne({
            where: { id },
        });
    }
    async getAuditStatistics(timeframe) {
        const now = new Date();
        let startDate;
        switch (timeframe) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
        }
        const auditBySeverity = await this.auditLogRepository
            .createQueryBuilder('log')
            .select('log.severity', 'severity')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.timestamp >= :startDate', { startDate })
            .groupBy('log.severity')
            .getRawMany();
        const accessBySeverity = await this.accessLogRepository
            .createQueryBuilder('log')
            .select('log.severity', 'severity')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.timestamp >= :startDate', { startDate })
            .groupBy('log.severity')
            .getRawMany();
        const topUsers = await this.auditLogRepository
            .createQueryBuilder('log')
            .select('log.userId', 'userId')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.timestamp >= :startDate', { startDate })
            .andWhere('log.userId IS NOT NULL')
            .groupBy('log.userId')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        const topIps = await this.accessLogRepository
            .createQueryBuilder('log')
            .select('log.ipAddress', 'ipAddress')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.timestamp >= :startDate', { startDate })
            .groupBy('log.ipAddress')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        return {
            timeframe,
            startDate,
            endDate: now,
            auditLogs: {
                total: await this.auditLogRepository.count({ where: { timestamp: (0, typeorm_2.Between)(startDate, now) } }),
                bySeverity: auditBySeverity,
            },
            accessLogs: {
                total: await this.accessLogRepository.count({ where: { timestamp: (0, typeorm_2.Between)(startDate, now) } }),
                bySeverity: accessBySeverity,
            },
            topUsers,
            topIps,
        };
    }
    async cleanOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .from(audit_log_entity_1.AuditLog)
            .where('timestamp < :cutoffDate', { cutoffDate })
            .execute();
        return result.affected || 0;
    }
    async cleanOldAccessLogs(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.accessLogRepository
            .createQueryBuilder()
            .delete()
            .from(access_log_entity_1.AccessLog)
            .where('timestamp < :cutoffDate', { cutoffDate })
            .execute();
        return result.affected || 0;
    }
    getClientIp(request) {
        if (!request)
            return '127.0.0.1';
        const forwardedFor = request.headers['x-forwarded-for'];
        if (forwardedFor) {
            return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
        }
        return request.ip || request.connection?.remoteAddress || '127.0.0.1';
    }
    getUserAgent(request) {
        if (!request)
            return 'Unknown';
        return request.headers['user-agent'] || 'Unknown';
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(1, (0, typeorm_1.InjectRepository)(access_log_entity_1.AccessLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map