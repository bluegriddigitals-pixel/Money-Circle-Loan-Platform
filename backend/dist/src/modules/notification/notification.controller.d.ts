import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<void>;
}
