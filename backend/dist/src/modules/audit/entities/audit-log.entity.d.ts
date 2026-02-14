export declare enum AuditSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class AuditLog {
    id: string;
    userId: string | null;
    action: string;
    details: string;
    ipAddress: string | null;
    userAgent: string | null;
    severity: AuditSeverity;
    metadata: Record<string, any> | null;
    timestamp: Date;
}
