import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDate,
  IsObject,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';

export enum AmlAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AmlAlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export enum AmlAlertType {
  SANCTIONS_MATCH = 'sanctions_match',
  PEP_MATCH = 'pep_match',
  ADVERSE_MEDIA = 'adverse_media',
  UNUSUAL_TRANSACTION = 'unusual_transaction',
  HIGH_RISK_COUNTRY = 'high_risk_country',
  VELOCITY_CHECK = 'velocity_check',
  STRUCTURING = 'structuring',
  ROUND_AMOUNTS = 'round_amounts',
  MULTIPLE_ACCOUNTS = 'multiple_accounts',
  OTHER = 'other',
}

@Entity('aml_alerts')
@Index(['userId'])
@Index(['severity'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class AmlAlert {
  @ApiProperty({
    description: 'Unique identifier for the AML alert',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Alert type',
    enum: AmlAlertType,
    example: AmlAlertType.SANCTIONS_MATCH,
  })
  @Column({
    type: 'enum',
    enum: AmlAlertType,
    nullable: false,
  })
  @IsEnum(AmlAlertType)
  type: AmlAlertType;

  @ApiProperty({
    description: 'Alert severity',
    enum: AmlAlertSeverity,
    example: AmlAlertSeverity.MEDIUM,
    default: AmlAlertSeverity.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: AmlAlertSeverity,
    default: AmlAlertSeverity.MEDIUM,
    nullable: false,
  })
  @IsEnum(AmlAlertSeverity)
  severity: AmlAlertSeverity;

  @ApiProperty({
    description: 'Alert status',
    enum: AmlAlertStatus,
    example: AmlAlertStatus.NEW,
    default: AmlAlertStatus.NEW,
  })
  @Column({
    type: 'enum',
    enum: AmlAlertStatus,
    default: AmlAlertStatus.NEW,
    nullable: false,
  })
  @IsEnum(AmlAlertStatus)
  status: AmlAlertStatus;

  @ApiProperty({
    description: 'Alert title',
    example: 'Sanctions Match Detected',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Alert description',
    example: 'User matched with OFAC SDN list',
  })
  @Column({ type: 'text', nullable: false })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Risk score',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;

  @ApiPropertyOptional({
    description: 'Transaction ID (if applicable)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Transaction amount',
    example: 10000.00,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  transactionAmount: number;

  @ApiPropertyOptional({
    description: 'Transaction currency',
    example: 'USD',
  })
  @Column({ type: 'varchar', length: 3, nullable: true })
  @IsOptional()
  @IsString()
  transactionCurrency: string;

  @ApiPropertyOptional({
    description: 'Transaction date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  transactionDate: Date;

  @ApiPropertyOptional({
    description: 'Match details',
    example: {
      list: 'ofac',
      matchedName: 'John Doe',
      sanctionId: 'SDN-12345',
      score: 95,
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  matchDetails: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Supporting evidence',
    example: ['https://s3.amazonaws.com/bucket/evidence1.pdf'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  evidence: string[];

  @ApiPropertyOptional({
    description: 'Acknowledged at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  acknowledgedAt: Date;

  @ApiPropertyOptional({
    description: 'Acknowledged by',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  acknowledgedBy: string;

  @ApiPropertyOptional({
    description: 'Resolved at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  resolvedAt: Date;

  @ApiPropertyOptional({
    description: 'Resolved by',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  resolvedBy: string;

  @ApiPropertyOptional({
    description: 'Resolution',
    example: 'Confirmed false positive - different DOB',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  resolution: string;

  @ApiPropertyOptional({
    description: 'Escalated at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  escalatedAt: Date;

  @ApiPropertyOptional({
    description: 'Escalated by',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escalatedBy: string;

  @ApiPropertyOptional({
    description: 'Escalated to',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  escalatedTo: string;

  @ApiPropertyOptional({
    description: 'Escalation reason',
    example: 'High risk - requires manager review',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  escalationReason: string;

  @ApiPropertyOptional({
    description: 'Assigned to',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  assignedTo: string;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Customer has legitimate business in high-risk country',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['urgent', 'high_value', 'repeat_offender'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Metadata',
    example: { source: 'automated_screening', ruleId: 'AML-RULE-001' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Alert creation timestamp',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    readOnly: true,
  })
  @UpdateDateColumn({ type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.amlAlerts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Virtual properties
  @Expose()
  get isNew(): boolean {
    return this.status === AmlAlertStatus.NEW;
  }

  @Expose()
  get isAcknowledged(): boolean {
    return this.status === AmlAlertStatus.ACKNOWLEDGED;
  }

  @Expose()
  get isResolved(): boolean {
    return this.status === AmlAlertStatus.RESOLVED;
  }

  @Expose()
  get isEscalated(): boolean {
    return this.status === AmlAlertStatus.ESCALATED;
  }

  @Expose()
  get isFalsePositive(): boolean {
    return this.status === AmlAlertStatus.FALSE_POSITIVE;
  }

  @Expose()
  get isClosed(): boolean {
    return this.status === AmlAlertStatus.CLOSED;
  }

  @Expose()
  get age(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }
}