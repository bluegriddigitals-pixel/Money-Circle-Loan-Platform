import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/user/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const SKIP_2FA_KEY = 'skip2fa';
export const Skip2FA = () => SetMetadata(SKIP_2FA_KEY, true);

export const RATE_LIMIT_KEY = 'rateLimit';
export interface RateLimitOptions {
  ttl: number;
  limit: number;
}
export const RateLimit = (ttl: number, limit: number) => 
  SetMetadata(RATE_LIMIT_KEY, { ttl, limit });

export const AUDIT_LOG_KEY = 'auditLog';
export interface AuditLogOptions {
  action: string;
  resource: string;
  sensitive?: boolean;
}
export const AuditLog = (options: AuditLogOptions) => 
  SetMetadata(AUDIT_LOG_KEY, options);