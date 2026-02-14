import { User } from '../../user/entities/user.entity';
export declare class NotificationPreference {
    id: string;
    user: User;
    userId: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    loanUpdates: boolean;
    paymentReminders: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    promotionalSms: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
