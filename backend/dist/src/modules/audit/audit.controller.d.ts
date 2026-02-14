import { AuditService } from './audit.service';
import { AuditLog, AuditSeverity } from './entities/audit-log.entity';
import { AccessLog, AccessSeverity } from './entities/access-log.entity';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditLogs(userId?: string, action?: string, severity?: AuditSeverity, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<{
        items: AuditLog[];
        total: number;
    }>;
    getAccessLogs(userId?: string, action?: string, ipAddress?: string, severity?: AccessSeverity, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<{
        items: AccessLog[];
        total: number;
    }>;
    getUserAuditLogs(userId: string, limit?: number, offset?: number): Promise<AuditLog[]>;
    getAccessLogsByIp(ipAddress: string, limit?: number, offset?: number): Promise<AccessLog[]>;
    getAuditLogById(id: string): Promise<AuditLog>;
    getAccessLogById(id: string): Promise<AccessLog>;
    getAuditStatistics(timeframe: 'day' | 'week' | 'month' | 'year'): Promise<any>;
    getUserAuditSummary(userId: string): Promise<{
        totalAudits: number;
        totalAccesses: number;
        lastActivity: Date | null;
        severityBreakdown: any;
    }>;
    healthCheck(): Promise<{
        status: string;
        timestamp: Date;
    }>;
}
