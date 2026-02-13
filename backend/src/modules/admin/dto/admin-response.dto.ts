import { Exclude, Expose } from 'class-transformer';

export class AdminUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: string;

  @Expose()
  permissions: string[];

  @Expose()
  department: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  title: string;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt: Date;

  @Expose()
  createdAt: Date;

  @Exclude()
  passwordHash: string;
}