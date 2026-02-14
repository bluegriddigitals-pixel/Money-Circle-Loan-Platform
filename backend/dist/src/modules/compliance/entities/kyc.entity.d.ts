import { User } from '../../user/entities/user.entity';
import { KycDocument } from './kyc-document.entity';
export declare enum KycStatus {
    INITIATED = "initiated",
    SUBMITTED = "submitted",
    APPROVED = "approved",
    REJECTED = "rejected",
    RETURNED = "returned",
    EXPIRED = "expired",
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    VERIFIED = "verified",
    PENDING = "pending",
    REVIEW = "review",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare class Kyc {
    id: string;
    user: User;
    userId: string;
    status: KycStatus;
    submittedAt: Date;
    reviewedAt: Date;
    reviewedBy: string;
    reviewNotes: string;
    rejectionReason: string;
    returnReason: string;
    expiredAt: Date;
    metadata: Record<string, any>;
    documents: KycDocument[];
    createdAt: Date;
    updatedAt: Date;
}
