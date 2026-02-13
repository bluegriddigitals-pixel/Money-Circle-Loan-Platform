import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean, IsArray, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  title?: string;
}