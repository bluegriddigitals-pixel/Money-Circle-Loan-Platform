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
  IsBoolean,
  IsObject,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Kyc } from './kyc.entity';

export enum KycDocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  RESIDENCE_PERMIT = 'residence_permit',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  TAX_RETURN = 'tax_return',
  INCORPORATION_CERTIFICATE = 'incorporation_certificate',
  ARTICLES_OF_ASSOCIATION = 'articles_of_association',
  PROOF_OF_ADDRESS = 'proof_of_address',
  SELFIE = 'selfie',
  OTHER = 'other',
}

export enum KycDocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('kyc_documents')
@Index(['kycId'])
@Index(['status'])
@Index(['type'])
export class KycDocument {
  @ApiProperty({
    description: 'Unique identifier for the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'KYC ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  kycId: string;

  @ApiProperty({
    description: 'Document type',
    enum: KycDocumentType,
    example: KycDocumentType.PASSPORT,
  })
  @Column({
    type: 'enum',
    enum: KycDocumentType,
    nullable: false,
  })
  @IsEnum(KycDocumentType)
  type: KycDocumentType;

  @ApiProperty({
    description: 'Document status',
    enum: KycDocumentStatus,
    example: KycDocumentStatus.UPLOADED,
    default: KycDocumentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: KycDocumentStatus,
    default: KycDocumentStatus.PENDING,
    nullable: false,
  })
  @IsEnum(KycDocumentStatus)
  status: KycDocumentStatus;

  @ApiProperty({
    description: 'Document name',
    example: 'passport.jpg',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'File name',
    example: 'passport_john_doe_2024.jpg',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    description: 'File path',
    example: '/uploads/kyc/passport_123.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: false })
  @IsString()
  @MaxLength(500)
  filePath: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  @Column({ type: 'int', nullable: false })
  @IsNumber()
  @Min(1)
  fileSize: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @ApiPropertyOptional({
    description: 'Document number',
    example: 'A12345678',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  documentNumber: string;

  @ApiPropertyOptional({
    description: 'Issue date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  issueDate: Date;

  @ApiPropertyOptional({
    description: 'Expiry date',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  expiryDate: Date;

  @ApiPropertyOptional({
    description: 'Country of issue',
    example: 'US',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  countryOfIssue: string;

  @ApiPropertyOptional({
    description: 'Uploaded at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  uploadedAt: Date;

  @ApiPropertyOptional({
    description: 'Verified at',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  verifiedAt: Date;

  @ApiPropertyOptional({
    description: 'Verified by',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  verifiedBy: string;

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
    example: 'Document is blurry',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Document verified successfully',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional({
    description: 'Is front side',
    example: true,
  })
  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  isFrontSide: boolean;

  @ApiPropertyOptional({
    description: 'Extracted data',
    example: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  extractedData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Metadata',
    example: { ocrConfidence: 0.95 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Document creation timestamp',
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
  @ManyToOne(() => Kyc, (kyc) => kyc.documents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kycId' })
  kyc: Kyc;

  // Virtual properties
  @Expose()
  get isVerified(): boolean {
    return this.status === KycDocumentStatus.VERIFIED;
  }

  @Expose()
  get isRejected(): boolean {
    return this.status === KycDocumentStatus.REJECTED;
  }

  @Expose()
  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  @Expose()
  get isUploaded(): boolean {
    return this.status === KycDocumentStatus.UPLOADED;
  }

  @Expose()
  get isPending(): boolean {
    return this.status === KycDocumentStatus.PENDING;
  }

  @Expose()
  get fileExtension(): string {
    if (!this.fileName) return '';
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  @Expose()
  get fileSizeFormatted(): string {
    if (!this.fileSize) return '0 Bytes';
    const bytes = this.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }

  @Expose()
  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}