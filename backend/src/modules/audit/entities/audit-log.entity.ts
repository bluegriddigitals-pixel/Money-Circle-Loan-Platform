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

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['severity'])
@Index(['timestamp'])
export class AuditLog {
  @ApiProperty({
    description: 'Unique identifier for the audit log',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiPropertyOptional({
    description: 'User ID who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  userId: string | null;

  @ApiProperty({
    description: 'Action performed',
    example: 'USER_REGISTERED',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Action details',
    example: 'User registered with role: borrower. IP: 192.168.1.1',
  })
  @Column({ type: 'text', nullable: false })
  @IsString()
  details: string;

  @ApiPropertyOptional({
    description: 'IP address of the client',
    example: '192.168.1.1',
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  @IsOptional()
  @IsString()
  ipAddress: string | null;

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
    enum: AuditSeverity,
    example: AuditSeverity.LOW,
    default: AuditSeverity.LOW,
  })
  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.LOW,
    nullable: false,
  })
  @IsEnum(AuditSeverity)
  severity: AuditSeverity;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { 
      resourceId: '123e4567-e89b-12d3-a456-426614174002',
      resourceType: 'loan',
      changes: { status: { from: 'draft', to: 'approved' } }
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'Timestamp when the action occurred',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  @IsDate()
  timestamp: Date;
}
