import { User } from '../../user/entities/user.entity';
export declare enum NotificationType {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}
export declare class Notification {
    id: string;
    user: User;
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    actionUrl: string;
    metadata: Record<string, any>;
    status: NotificationStatus;
    sentAt: Date;
    deliveredAt: Date;
    readAt: Date;
    failureReason: string;
    createdAt: Date;
}
