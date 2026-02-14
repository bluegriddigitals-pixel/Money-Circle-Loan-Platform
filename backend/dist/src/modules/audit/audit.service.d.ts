import { Repository } from 'typeorm';
import { AuditLog, AuditSeverity } from './entities/audit-log.entity';
import { AccessLog, AccessSeverity } from './entities/access-log.entity';
import { Request } from 'express';
export declare class AuditService {
    private readonly auditLogRepository;
    private readonly accessLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>, accessLogRepository: Repository<AccessLog>);
    logAudit(userId: string | null, action: string, details: string, request?: Request, severity?: AuditSeverity, metadata?: Record<string, any>): Promise<AuditLog>;
    logAccess(userId: string | null, action: string, details: string, request: Request, severity?: AccessSeverity, metadata?: Record<string, any>): Promise<AccessLog>;
    getAuditLogs(filters: {
        userId?: string;
        action?: string;
        severity?: AuditSeverity;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: AuditLog[];
        total: number;
    }>;
    getAccessLogs(filters: {
        userId?: string;
        action?: string;
        ipAddress?: string;
        severity?: AccessSeverity;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: AccessLog[];
        total: number;
    }>;
    getUserAuditLogs(userId: string, limit?: number, offset?: number): Promise<AuditLog[]>;
    getAccessLogsByIp(ipAddress: string, limit?: number, offset?: number): Promise<AccessLog[]>;
    getAuditLogById(id: string): Promise<AuditLog>;
    getAccessLogById(id: string): Promise<AccessLog>;
    getAuditStatistics(timeframe: 'day' | 'week' | 'month' | 'year'): Promise<any>;
    cleanOldLogs(daysToKeep?: number): Promise<number>;
    cleanOldAccessLogs(daysToKeep?: number): Promise<number>;
    private getClientIp;
    private getUserAgent;
}
