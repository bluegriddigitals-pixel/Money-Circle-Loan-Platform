export declare class AdminUserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    department: string;
    phoneNumber: string;
    title: string;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    passwordHash: string;
}
