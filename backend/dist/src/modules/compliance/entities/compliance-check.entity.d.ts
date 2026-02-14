import { User } from '../../user/entities/user.entity';
export declare enum ComplianceCheckType {
    IDENTITY = "identity",
    ADDRESS = "address",
    SANCTIONS = "sanctions",
    PEP = "pep",
    ADVERSE_MEDIA = "adverse_media",
    AML = "aml",
    CREDIT = "credit",
    BANK_ACCOUNT = "bank_account"
}
export declare enum ComplianceCheckStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    SKIPPED = "skipped"
}
export declare enum ComplianceCheckResult {
    PASS = "pass",
    FAIL = "fail",
    REVIEW = "review",
    PENDING = "pending"
}
export declare class ComplianceCheck {
    id: string;
    user: User;
    userId: string;
    checkType: ComplianceCheckType;
    status: ComplianceCheckStatus;
    result: ComplianceCheckResult;
    details: Record<string, any>;
    metadata: Record<string, any>;
    completedAt: Date;
    failureReason: string;
    createdAt: Date;
}
