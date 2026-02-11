import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDate,
  IsObject,
} from 'class-validator';

export enum AccessSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('access_logs')
@Index(['userId'])
@Index(['action'])
@Index(['ipAddress'])
@Index(['timestamp'])
export class AccessLog {
  @ApiProperty({
    description: 'Unique identifier for the access log',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiPropertyOptional({
    description: 'User ID who attempted access',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  userId: string | null;

  @ApiProperty({
    description: 'Action attempted',
    example: 'LOGIN_FAILED',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Action details',
    example: 'Failed login attempt: Invalid credentials',
  })
  @Column({ type: 'text', nullable: false })
  @IsString()
  details: string;

  @ApiProperty({
    description: 'IP address of the client',
    example: '192.168.1.1',
  })
  @Column({ type: 'varchar', length: 45, nullable: false })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'User agent of the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  userAgent: string | null;

  @ApiProperty({
    description: 'Severity level',
    enum: AccessSeverity,
    example: AccessSeverity.HIGH,
    default: AccessSeverity.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: AccessSeverity,
    default: AccessSeverity.MEDIUM,
    nullable: false,
  })
  @IsEnum(AccessSeverity)
  severity: AccessSeverity;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { attemptCount: 3, lockoutTime: '2024-01-01T00:00:00Z' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the access attempt occurred',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  @IsDate()
  timestamp: Date;
}