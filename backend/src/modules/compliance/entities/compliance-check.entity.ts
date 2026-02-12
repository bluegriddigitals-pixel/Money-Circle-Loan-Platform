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
  IsBoolean,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';

export enum ComplianceCheckType {
  AML = 'aml',
  SANCTIONS = 'sanctions',
  PEP = 'pep',
  ADVERSE_MEDIA = 'adverse_media',
  CREDIT_CHECK = 'credit_check',
  IDENTITY_VERIFICATION = 'identity_verification',
  ADDRESS_VERIFICATION = 'address_verification',
  EMPLOYMENT_VERIFICATION = 'employment_verification',
  INCOME_VERIFICATION = 'income_verification',
}

export enum ComplianceCheckStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum ComplianceCheckResult {
  PASS = 'pass',
  FAIL = 'fail',
  FLAGGED = 'flagged',
  REVIEW_REQUIRED = 'review_required',
  INCONCLUSIVE = 'inconclusive',
}

@Entity('compliance_checks')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['result'])
@Index(['performedAt'])
export class ComplianceCheck {
  @ApiProperty({
    description: 'Unique identifier for the compliance check',
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
    description: 'Check type',
    enum: ComplianceCheckType,
    example: ComplianceCheckType.AML,
  })
  @Column({
    type: 'enum',
    enum: ComplianceCheckType,
    nullable: false,
  })
  @IsEnum(ComplianceCheckType)
  type: ComplianceCheckType;

  @ApiProperty({
    description: 'Check status',
    enum: ComplianceCheckStatus,
    example: ComplianceCheckStatus.PENDING,
    default: ComplianceCheckStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ComplianceCheckStatus,
    default: ComplianceCheckStatus.PENDING,
    nullable: false,
  })
  @IsEnum(ComplianceCheckStatus)
  status: ComplianceCheckStatus;

  @ApiPropertyOptional({
    description: 'Check result',
    enum: ComplianceCheckResult,
    example: ComplianceCheckResult.PASS,
  })
  @Column({
    type: 'enum',
    enum: ComplianceCheckResult,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ComplianceCheckResult)
  result: ComplianceCheckResult;

  @ApiPropertyOptional({
    description: 'Score',
    example: 85,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({
    description: 'Confidence level',
    example: 0.95,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiPropertyOptional({
    description: 'Provider',
    example: 'kompli-global',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  provider: string;

  @ApiPropertyOptional({
    description: 'Provider reference',
    example: 'ref_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  providerReference: string;

  @ApiPropertyOptional({
    description: 'Request payload',
    example: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  requestData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Response payload',
    example: { matches: [], riskScore: 25 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  responseData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Flags',
    example: ['high_risk_country', 'name_match'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  flags: string[];

  @ApiPropertyOptional({
    description: 'Details',
    example: { matchCount: 0, riskLevel: 'LOW' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  details: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Performed at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  performedAt: Date;

  @ApiPropertyOptional({
    description: 'Completed at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  completedAt: Date;

  @ApiPropertyOptional({
    description: 'Expires at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Is manual review required',
    example: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isManualReviewRequired: boolean;

  @ApiPropertyOptional({
    description: 'Reviewed at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  reviewedAt: Date;

  @ApiPropertyOptional({
    description: 'Reviewed by',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  reviewedBy: string;

  @ApiPropertyOptional({
    description: 'Review notes',
    example: 'All checks passed',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes: string;

  @ApiPropertyOptional({
    description: 'Error message',
    example: 'Provider API timeout',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  errorMessage: string;

  @ApiPropertyOptional({
    description: 'Metadata',
    example: { retryCount: 2, duration: 1250 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Check creation timestamp',
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
  @ManyToOne(() => User, (user) => user.complianceChecks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Virtual properties
  @Expose()
  get isPassed(): boolean {
    return this.result === ComplianceCheckResult.PASS;
  }

  @Expose()
  get isFailed(): boolean {
    return this.result === ComplianceCheckResult.FAIL;
  }

  @Expose()
  get isFlagged(): boolean {
    return this.result === ComplianceCheckResult.FLAGGED;
  }

  @Expose()
  get requiresReview(): boolean {
    return this.result === ComplianceCheckResult.REVIEW_REQUIRED || this.isManualReviewRequired;
  }

  @Expose()
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  @Expose()
  get isCompleted(): boolean {
    return this.status === ComplianceCheckStatus.COMPLETED;
  }

  @Expose()
  get isPending(): boolean {
    return this.status === ComplianceCheckStatus.PENDING;
  }

  @Expose()
  get isInProgress(): boolean {
    return this.status === ComplianceCheckStatus.IN_PROGRESS;
  }

  @Expose()
  get isStatusFailed(): boolean {
    return this.status === ComplianceCheckStatus.FAILED;
  }
}