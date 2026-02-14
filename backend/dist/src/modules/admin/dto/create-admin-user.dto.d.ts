import { UserRole } from '../../../shared/enums/user-role.enum';
export declare class CreateAdminUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions?: string[];
    isActive?: boolean;
    department?: string;
    phoneNumber?: string;
    title?: string;
}
