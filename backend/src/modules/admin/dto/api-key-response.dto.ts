import { Exclude, Expose } from 'class-transformer';

export class ApiKeyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  permissions: string[];

  @Expose()
  expiresAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  lastUsedAt: Date;

  @Expose()
  isActive: boolean;

  @Exclude()
  key: string; // Hide the actual key in responses
}