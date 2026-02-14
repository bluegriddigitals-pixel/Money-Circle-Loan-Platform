import { AdminAction } from './admin-action.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';
export declare class AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    role: UserRole;
    permissions: string[];
    department: string;
    phoneNumber: string;
    title: string;
    isActive: boolean;
    lastLoginAt: Date;
    createdById: string;
    createdBy: AdminUser;
    adminActions: AdminAction[];
    createdAt: Date;
    updatedAt: Date;
}
