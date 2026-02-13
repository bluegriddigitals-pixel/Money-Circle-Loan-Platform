import { IsString, IsObject, IsOptional, IsIP, IsEnum, IsUUID } from 'class-validator';

export enum AdminActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CONFIG_CHANGE = 'config_change',
  PERMISSION_CHANGE = 'permission_change',
  USER_MANAGEMENT = 'user_management',
  SYSTEM_MAINTENANCE = 'system_maintenance',
}

export class AdminActionDto {
  @IsEnum(AdminActionType)
  action: AdminActionType;

  @IsObject()
  details: Record<string, any>;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}