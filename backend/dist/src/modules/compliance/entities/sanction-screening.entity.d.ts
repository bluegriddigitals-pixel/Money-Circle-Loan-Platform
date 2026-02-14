import { User } from '../../user/entities/user.entity';
export declare enum SanctionScreeningStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum SanctionMatchStatus {
    NO_MATCH = "no_match",
    POTENTIAL_MATCH = "potential_match",
    CONFIRMED_MATCH = "confirmed_match",
    FALSE_POSITIVE = "false_positive"
}
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class SanctionScreening {
    id: string;
    user: User;
    userId: string;
    status: SanctionScreeningStatus;
    matchStatus: SanctionMatchStatus;
    riskLevel: RiskLevel;
    matches: Array<{
        listName: string;
        matchScore: number;
        matchedName: string;
        matchedId: string;
        matchDetails: Record<string, any>;
    }>;
    requestData: Record<string, any>;
    responseData: Record<string, any>;
    screenedAt: Date;
    completedAt: Date;
    failureReason: string;
    reviewedBy: string;
    reviewedAt: Date;
    reviewNotes: string;
    createdAt: Date;
}
