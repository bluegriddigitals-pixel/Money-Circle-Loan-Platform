import { User } from '../../user/entities/user.entity';
export declare enum AmlAlertStatus {
    PENDING = "pending",
    ACKNOWLEDGED = "acknowledged",
    IN_REVIEW = "in_review",
    RESOLVED = "resolved",
    ESCALATED = "escalated",
    CLOSED = "closed",
    FALSE_POSITIVE = "false_positive"
}
export declare enum AmlAlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum AmlAlertType {
    TRANSACTION = "transaction",
    BEHAVIORAL = "behavioral",
    SANCTIONS = "sanctions",
    PEP = "pep",
    ADVERSE_MEDIA = "adverse_media",
    VELOCITY = "velocity",
    GEO_LOCATION = "geo_location",
    STRUCTURING = "structuring"
}
export declare class AmlAlert {
    id: string;
    user: User;
    userId: string;
    alertType: AmlAlertType;
    severity: AmlAlertSeverity;
    status: AmlAlertStatus;
    description: string;
    details: Record<string, any>;
    acknowledgedBy: string;
    acknowledgedAt: Date;
    resolvedBy: string;
    resolvedAt: Date;
    resolution: string;
    escalatedBy: string;
    escalatedAt: Date;
    escalationReason: string;
    assignedTo: string;
    dueDate: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
