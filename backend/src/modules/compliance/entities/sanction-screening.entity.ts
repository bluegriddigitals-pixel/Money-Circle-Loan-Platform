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

export enum SanctionList {
  OFAC = 'ofac',
  UN = 'un',
  EU = 'eu',
  UK = 'uk',
  INTERPOL = 'interpol',
  WORLD_BANK = 'world_bank',
  DFAT = 'dfat',
  OTHER = 'other',
}

export enum SanctionScreeningStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SanctionMatchStatus {
  NO_MATCH = 'no_match',
  POTENTIAL_MATCH = 'potential_match',
  CONFIRMED_MATCH = 'confirmed_match',
  FALSE_POSITIVE = 'false_positive',
}

@Entity('sanction_screenings')
@Index(['userId'])
@Index(['status'])
@Index(['matchStatus'])
@Index(['screenedAt'])
export class SanctionScreening {
  @ApiProperty({
    description: 'Unique identifier for the sanction screening',
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
    description: 'Screening status',
    enum: SanctionScreeningStatus,
    example: SanctionScreeningStatus.PENDING,
    default: SanctionScreeningStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: SanctionScreeningStatus,
    default: SanctionScreeningStatus.PENDING,
    nullable: false,
  })
  @IsEnum(SanctionScreeningStatus)
  status: SanctionScreeningStatus;

  @ApiProperty({
    description: 'Match status',
    enum: SanctionMatchStatus,
    example: SanctionMatchStatus.NO_MATCH,
    default: SanctionMatchStatus.NO_MATCH,
  })
  @Column({
    type: 'enum',
    enum: SanctionMatchStatus,
    default: SanctionMatchStatus.NO_MATCH,
    nullable: false,
  })
  @IsEnum(SanctionMatchStatus)
  matchStatus: SanctionMatchStatus;

  @ApiPropertyOptional({
    description: 'Lists screened',
    example: ['ofac', 'un', 'eu'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  listsScreened: string[];

  @ApiPropertyOptional({
    description: 'Lists with matches',
    example: ['ofac'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  listsWithMatches: string[];

  @ApiPropertyOptional({
    description: 'Match details',
    example: [
      {
        list: 'ofac',
        matchedName: 'John Doe',
        sanctionId: 'SDN-12345',
        program: 'SDNT',
        score: 95,
      },
    ],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  matches: Array<{
    list: string;
    matchedName: string;
    sanctionId?: string;
    program?: string;
    score: number;
    additionalInfo?: Record<string, any>;
  }>;

  @ApiPropertyOptional({
    description: 'Confidence score',
    example: 98.5,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore: number;

  @ApiPropertyOptional({
    description: 'Provider',
    example: 'world-check',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  provider: string;

  @ApiPropertyOptional({
    description: 'Provider reference',
    example: 'wc_123456789',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  providerReference: string;

  @ApiPropertyOptional({
    description: 'Request data',
    example: { fullName: 'John Doe', dateOfBirth: '1990-01-01', country: 'US' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  requestData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Response data',
    example: { matches: [], totalHits: 0 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  responseData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Screened at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  screenedAt: Date;

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
    example: 'Confirmed false positive - different DOB',
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
    example: { duration: 2345, retryCount: 1 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Screening creation timestamp',
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
  @ManyToOne(() => User, (user) => user.sanctionScreenings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Virtual properties
  @Expose()
  get hasMatches(): boolean {
    return this.matchStatus !== SanctionMatchStatus.NO_MATCH;
  }

  @Expose()
  get isConfirmedMatch(): boolean {
    return this.matchStatus === SanctionMatchStatus.CONFIRMED_MATCH;
  }

  @Expose()
  get isPotentialMatch(): boolean {
    return this.matchStatus === SanctionMatchStatus.POTENTIAL_MATCH;
  }

  @Expose()
  get isFalsePositive(): boolean {
    return this.matchStatus === SanctionMatchStatus.FALSE_POSITIVE;
  }

  @Expose()
  get matchCount(): number {
    return this.matches?.length || 0;
  }

  @Expose()
  get isCompleted(): boolean {
    return this.status === SanctionScreeningStatus.COMPLETED;
  }

  @Expose()
  get isFailed(): boolean {
    return this.status === SanctionScreeningStatus.FAILED;
  }

  @Expose()
  get isPending(): boolean {
    return this.status === SanctionScreeningStatus.PENDING;
  }

  @Expose()
  get isInProgress(): boolean {
    return this.status === SanctionScreeningStatus.IN_PROGRESS;
  }
}