import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
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
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { KycDocument } from './kyc-document.entity';

export enum KycStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  RETURNED = 'returned',
}

export enum KycLevel {
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
}

export enum KycType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate',
}

@Entity('kyc')
@Index(['userId'])
@Index(['status'])
@Index(['level'])
@Index(['submittedAt'])
export class Kyc {
  @ApiProperty({
    description: 'Unique identifier for the KYC record',
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
    description: 'KYC status',
    enum: KycStatus,
    example: KycStatus.NOT_STARTED,
    default: KycStatus.NOT_STARTED,
  })
  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
    nullable: false,
  })
  @IsEnum(KycStatus)
  status: KycStatus;

  @ApiProperty({
    description: 'KYC level',
    enum: KycLevel,
    example: KycLevel.LEVEL_1,
    default: KycLevel.LEVEL_1,
  })
  @Column({
    type: 'enum',
    enum: KycLevel,
    default: KycLevel.LEVEL_1,
    nullable: false,
  })
  @IsEnum(KycLevel)
  level: KycLevel;

  @ApiProperty({
    description: 'KYC type',
    enum: KycType,
    example: KycType.INDIVIDUAL,
    default: KycType.INDIVIDUAL,
  })
  @Column({
    type: 'enum',
    enum: KycType,
    default: KycType.INDIVIDUAL,
    nullable: false,
  })
  @IsEnum(KycType)
  type: KycType;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'Nationality',
    example: 'US',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  nationality: string;

  @ApiPropertyOptional({
    description: 'Country of residence',
    example: 'US',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  countryOfResidence: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Main St',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Apt 4B',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  addressLine2: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'New York',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  city: string;

  @ApiPropertyOptional({
    description: 'State/Province',
    example: 'NY',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  state: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '10001',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({
    description: 'ID document type',
    example: 'passport',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  idDocumentType: string;

  @ApiPropertyOptional({
    description: 'ID document number',
    example: 'A12345678',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  idDocumentNumber: string;

  @ApiPropertyOptional({
    description: 'ID document expiry date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  idDocumentExpiryDate: Date;

  @ApiPropertyOptional({
    description: 'ID document country of issue',
    example: 'US',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  idDocumentCountry: string;

  @ApiPropertyOptional({
    description: 'Risk score',
    example: 25,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  riskScore: number;

  @ApiPropertyOptional({
    description: 'Risk factors',
    example: ['high_risk_country', 'pep'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  riskFactors: string[];

  @ApiPropertyOptional({
    description: 'Verification score',
    example: 85,
  })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  verificationScore: number;

  @ApiPropertyOptional({
    description: 'Submitted at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  submittedAt: Date;

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
    description: 'Approved at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  approvedAt: Date;

  @ApiPropertyOptional({
    description: 'Approved by',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Rejected at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  rejectedAt: Date;

  @ApiPropertyOptional({
    description: 'Rejected by',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  rejectedBy: string;

  @ApiPropertyOptional({
    description: 'Rejection reason',
    example: 'Invalid document',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Returned at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  returnedAt: Date;

  @ApiPropertyOptional({
    description: 'Returned by',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  returnedBy: string;

  @ApiPropertyOptional({
    description: 'Return reason',
    example: 'Additional documents required',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  returnReason: string;

  @ApiPropertyOptional({
    description: 'Expired at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  expiredAt: Date;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Customer provided valid passport',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Requires additional verification',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiPropertyOptional({
    description: 'Metadata',
    example: { source: 'web', ip: '192.168.1.1' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'KYC creation timestamp',
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
  @ManyToOne(() => User, (user) => user.kyc, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => KycDocument, (document) => document.kyc, {
    cascade: true,
  })
  documents: KycDocument[];

  // Virtual properties
  @Expose()
  get isVerified(): boolean {
    return this.status === KycStatus.VERIFIED;
  }

  @Expose()
  get isRejected(): boolean {
    return this.status === KycStatus.REJECTED;
  }

  @Expose()
  get isPending(): boolean {
    return this.status === KycStatus.SUBMITTED || this.status === KycStatus.UNDER_REVIEW;
  }

  @Expose()
  get isExpired(): boolean {
    if (!this.idDocumentExpiryDate) return false;
    return new Date() > this.idDocumentExpiryDate;
  }

  @Expose()
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}