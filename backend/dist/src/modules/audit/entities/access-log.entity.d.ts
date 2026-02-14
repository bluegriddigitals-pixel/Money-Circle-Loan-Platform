export declare enum AccessSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class AccessLog {
    id: string;
    userId: string | null;
    action: string;
    details: string;
    ipAddress: string;
    userAgent: string | null;
    severity: AccessSeverity;
    metadata: Record<string, any>;
    timestamp: Date;
}
