import { AdminUser } from './admin-user.entity';
export declare class SystemMaintenance {
    id: string;
    startTime: Date;
    endTime: Date;
    description: string;
    isActive: boolean;
    createdBy: AdminUser;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}
