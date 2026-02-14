import { UserRole } from '../../modules/user/entities/user.entity';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSIONS_KEY = "permissions";
export declare const Permissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const SKIP_2FA_KEY = "skip2fa";
export declare const Skip2FA: () => import("@nestjs/common").CustomDecorator<string>;
export declare const RATE_LIMIT_KEY = "rateLimit";
export interface RateLimitOptions {
    ttl: number;
    limit: number;
}
export declare const RateLimit: (ttl: number, limit: number) => import("@nestjs/common").CustomDecorator<string>;
export declare const AUDIT_LOG_KEY = "auditLog";
export interface AuditLogOptions {
    action: string;
    resource: string;
    sensitive?: boolean;
}
export declare const AuditLog: (options: AuditLogOptions) => import("@nestjs/common").CustomDecorator<string>;
