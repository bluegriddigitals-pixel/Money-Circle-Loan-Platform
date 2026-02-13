import { Expose } from 'class-transformer';

export class SystemConfigResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string;

  @Expose()
  value: any;

  @Expose()
  description: string;

  @Expose()
  dataType: string;

  @Expose()
  category: string;

  @Expose()
  isPublic: boolean;

  @Expose()
  updatedAt: Date;
}