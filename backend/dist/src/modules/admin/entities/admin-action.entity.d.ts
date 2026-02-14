import { AdminUser } from './admin-user.entity';
export declare class AdminAction {
    id: string;
    adminUser: AdminUser;
    adminUserId: string;
    action: string;
    details: any;
    resourceType: string;
    resourceId: string;
    ipAddress: string;
    userAgent: string;
    metadata: any;
    createdAt: Date;
}
