import { IsString, IsArray, IsOptional, IsDateString, IsEnum, MinLength } from 'class-validator';

export enum ApiKeyPermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  REPORTS = 'reports',
  PAYMENTS = 'payments',
  USERS = 'users',
  LOANS = 'loans',
}

export class GenerateApiKeyDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsArray()
  @IsEnum(ApiKeyPermission, { each: true, message: 'Invalid permission' })
  permissions: ApiKeyPermission[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIps?: string[];
}