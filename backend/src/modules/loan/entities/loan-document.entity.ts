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
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
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
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  MinLength,
  IsObject,
  ValidateNested,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanGuarantor } from './loan-guarantor.entity';
import { LoanCollateral } from './loan-collateral.entity';

export enum DocumentType {
  IDENTITY_PROOF = 'identity_proof',
  ADDRESS_PROOF = 'address_proof',
  INCOME_PROOF = 'income_proof',
  BANK_STATEMENT = 'bank_statement',
  TAX_RETURN = 'tax_return',
  BUSINESS_REGISTRATION = 'business_registration',
  COLLATERAL_DOCUMENT = 'collateral_document',
  GUARANTOR_DOCUMENT = 'guarantor_document',
  LOAN_AGREEMENT = 'loan_agreement',
  REPAYMENT_SCHEDULE = 'repayment_schedule',
  DISBURSEMENT_PROOF = 'disbursement_proof',
  PAYMENT_RECEIPT = 'payment_receipt',
  LEGAL_DOCUMENT = 'legal_document',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING_UPLOAD = 'pending_upload',
  UPLOADED = 'uploaded',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum DocumentFormat {
  PDF = 'pdf',
  JPEG = 'jpeg',
  PNG = 'png',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  TXT = 'txt',
}

export enum VerificationMethod {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  THIRD_PARTY = 'third_party',
}

@Entity('loan_documents')
@Index(['loanId'])
@Index(['loanApplicationId'])
@Index(['guarantorId'])
@Index(['collateralId'])
@Index(['documentType'])
@Index(['status'])
@Index(['uploadedById'])
@Index(['verifiedById'])
@Index(['createdAt'])
export class LoanDocument {
  @ApiProperty({
    description: 'Unique identifier for the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Unique document reference number',
    example: 'DOC-2024-001234',
    readOnly: true,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiPropertyOptional({
    description: 'ID of the loan (if associated with a loan)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanId: string;

  @ApiPropertyOptional({
    description: 'ID of the loan application (if associated with an application)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  loanApplicationId: string;

  @ApiPropertyOptional({
    description: 'ID of the guarantor (if associated with a guarantor)',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  guarantorId: string;

  @ApiPropertyOptional({
    description: 'ID of the collateral (if associated with collateral)',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  collateralId: string;

  @ApiProperty({
    description: 'Document type',
    enum: DocumentType,
    example: DocumentType.IDENTITY_PROOF,
  })
  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: false,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'Document name/title',
    example: 'Passport - John Doe',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Bio-data page of passport showing photo and personal details',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Document file name',
    example: 'passport_john_doe_2024.pdf',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
    minimum: 1,
  })
  @Column({ type: 'bigint', nullable: false })
  @IsNumber()
  @Min(1)
  fileSize: number;

  @ApiProperty({
    description: 'File format/extension',
    enum: DocumentFormat,
    example: DocumentFormat.PDF,
  })
  @Column({
    type: 'enum',
    enum: DocumentFormat,
    nullable: false,
  })
  @IsEnum(DocumentFormat)
  fileFormat: DocumentFormat;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType: string;

  @ApiProperty({
    description: 'Storage path/URL',
    example: 'https://s3.amazonaws.com/bucket/documents/passport.pdf',
  })
  @Column({ type: 'text', nullable: false })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  storagePath: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL (for images/PDFs)',
    example: 'https://s3.amazonaws.com/bucket/thumbnails/passport_thumb.jpg',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  thumbnailPath: string;

  @ApiPropertyOptional({
    description: 'Document hash (for integrity verification)',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd',
  })
  @Column({ type: 'varchar', length: 64, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  fileHash: string;

  @ApiProperty({
    description: 'Document status',
    enum: DocumentStatus,
    example: DocumentStatus.UPLOADED,
    default: DocumentStatus.PENDING_UPLOAD,
  })
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING_UPLOAD,
    nullable: false,
  })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Verification status',
    example: 'pending',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  verificationStatus: string;

  @ApiPropertyOptional({
    description: 'Verification method',
    enum: VerificationMethod,
    example: VerificationMethod.MANUAL,
  })
  @Column({
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(VerificationMethod)
  verificationMethod: VerificationMethod;

  @ApiPropertyOptional({
    description: 'Verification score/confidence (0-100)',
    example: 95.5,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  verificationScore: number;

  @ApiPropertyOptional({
    description: 'Verification details/results',
    example: {
      name_match: true,
      date_of_birth_match: true,
      document_validity: 'valid',
      issue_date: '2020-01-15',
      expiry_date: '2030-01-15',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  verificationDetails: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Rejection reason (if rejected)',
    example: 'Document is blurry and unreadable',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Document requires manual verification due to poor image quality',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['primary', 'urgent', 'requires_review'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Document metadata',
    example: {
      pages: 2,
      resolution: '300dpi',
      color_mode: 'color',
      language: 'en',
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: 'OCR/extracted text data',
    example: 'JOHN DOE\nDATE OF BIRTH: 1990-01-01\n...',
  })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  extractedText: string;

  @ApiPropertyOptional({
    description: 'OCR confidence score',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  ocrConfidence: number;

  @ApiPropertyOptional({
    description: 'Document expiry date',
    example: '2030-01-15',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @ApiPropertyOptional({
    description: 'Issue date',
    example: '2020-01-15',
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiPropertyOptional({
    description: 'Document number (as shown on document)',
    example: 'A12345678',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumberOnFile: string;

  @ApiPropertyOptional({
    description: 'Issuing authority/country',
    example: 'United States Department of State',
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingAuthority: string;

  @ApiPropertyOptional({
    description: 'Issuing country code (ISO 3166-1 alpha-2)',
    example: 'US',
  })
  @Column({ type: 'varchar', length: 2, nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  issuingCountry: string;

  @ApiPropertyOptional({
    description: 'Whether document is required',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Whether document is sensitive/confidential',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isConfidential: boolean;

  @ApiPropertyOptional({
    description: 'Whether document is shared with third parties',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isShared: boolean;

  @ApiPropertyOptional({
    description: 'Third parties with whom document is shared',
    example: ['credit_bureau', 'insurance_company'],
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  sharedWith: string[];

  @ApiPropertyOptional({
    description: 'Retention period in months',
    example: 84,
    default: 84,
  })
  @Column({ type: 'integer', default: 84, nullable: false })
  @IsInt()
  @Min(1)
  retentionPeriodMonths: number;

  @ApiPropertyOptional({
    description: 'Auto-delete date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  autoDeleteDate: Date;

  @ApiPropertyOptional({
    description: 'ID of user who uploaded the document',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  uploadedById: string;

  @ApiPropertyOptional({
    description: 'Upload date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  uploadedAt: Date;

  @ApiPropertyOptional({
    description: 'ID of user who verified the document',
    example: '123e4567-e89b-12d3-a456-426614174006',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  verifiedById: string;

  @ApiPropertyOptional({
    description: 'Verification date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  verifiedAt: Date;

  @ApiPropertyOptional({
    description: 'Rejection date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedAt: Date;

  @ApiPropertyOptional({
    description: 'Review start date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reviewStartDate: Date;

  @ApiPropertyOptional({
    description: 'Review end date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reviewEndDate: Date;

  @ApiPropertyOptional({
    description: 'Last viewed date',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastViewedAt: Date;

  @ApiPropertyOptional({
    description: 'Last viewed by user ID',
    example: '123e4567-e89b-12d3-a456-426614174007',
  })
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  lastViewedById: string;

  @ApiPropertyOptional({
    description: 'Download count',
    example: 3,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsInt()
  @Min(0)
  downloadCount: number;

  @ApiPropertyOptional({
    description: 'View count',
    example: 5,
    default: 0,
  })
  @Column({ type: 'integer', default: 0, nullable: false })
  @IsInt()
  @Min(0)
  viewCount: number;

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
  @ApiPropertyOptional({
    description: 'Loan associated with this document',
    type: () => Loan,
  })
  @ManyToOne(() => Loan, (loan) => loan.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanId' })
  @ValidateNested()
  @Type(() => Loan)
  loan: Loan;

  @ApiPropertyOptional({
    description: 'Loan application associated with this document',
    type: () => LoanApplication,
  })
  @ManyToOne(() => LoanApplication, (application) => application.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanApplicationId' })
  @ValidateNested()
  @Type(() => LoanApplication)
  loanApplication: LoanApplication;

  @ApiPropertyOptional({
    description: 'Guarantor associated with this document',
    type: () => LoanGuarantor,
  })
  @ManyToOne(() => LoanGuarantor, (guarantor) => guarantor.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guarantorId' })
  @ValidateNested()
  @Type(() => LoanGuarantor)
  guarantor: LoanGuarantor;

  @ApiPropertyOptional({
    description: 'Collateral associated with this document',
    type: () => LoanCollateral,
  })
  @ManyToOne(() => LoanCollateral, (collateral) => collateral.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collateralId' })
  @ValidateNested()
  @Type(() => LoanCollateral)
  collateral: LoanCollateral;

  // Computed properties
  @ApiProperty({
    description: 'File size in human-readable format',
    example: '2.0 MB',
    readOnly: true,
  })
  @Expose()
  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  @ApiProperty({
    description: 'Whether document is uploaded',
    example: true,
    readOnly: true,
  })
  @Expose()
  get isUploaded(): boolean {
    return this.status === DocumentStatus.UPLOADED;
  }

  @ApiProperty({
    description: 'Whether document is verified',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isVerified(): boolean {
    return this.status === DocumentStatus.VERIFIED;
  }

  @ApiProperty({
    description: 'Whether document is rejected',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isRejected(): boolean {
    return this.status === DocumentStatus.REJECTED;
  }

  @ApiProperty({
    description: 'Whether document is under review',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isUnderReview(): boolean {
    return this.status === DocumentStatus.UNDER_REVIEW;
  }

  @ApiProperty({
    description: 'Whether document is expired',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isExpired(): boolean {
    return this.status === DocumentStatus.EXPIRED || 
           (this.expiryDate && new Date() > this.expiryDate);
  }

  @ApiProperty({
    description: 'Days until expiry (negative if expired)',
    example: 365,
    readOnly: true,
  })
  @Expose()
  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(this.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Document age in days',
    example: 5,
    readOnly: true,
  })
  @Expose()
  get ageInDays(): number {
    if (!this.createdAt) return 0;
    const today = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @ApiProperty({
    description: 'Whether document needs review',
    example: true,
    readOnly: true,
  })
  @Expose()
  get needsReview(): boolean {
    return this.isUploaded && !this.isVerified && !this.isRejected && !this.isUnderReview;
  }

  @ApiProperty({
    description: 'Whether document is valid (verified and not expired)',
    example: false,
    readOnly: true,
  })
  @Expose()
  get isValid(): boolean {
    return this.isVerified && !this.isExpired;
  }

  @ApiProperty({
    description: 'Document category',
    example: 'identity',
    readOnly: true,
  })
  @Expose()
  get category(): string {
    switch (this.documentType) {
      case DocumentType.IDENTITY_PROOF:
      case DocumentType.ADDRESS_PROOF:
        return 'personal';
      case DocumentType.INCOME_PROOF:
      case DocumentType.BANK_STATEMENT:
      case DocumentType.TAX_RETURN:
        return 'financial';
      case DocumentType.BUSINESS_REGISTRATION:
        return 'business';
      case DocumentType.COLLATERAL_DOCUMENT:
        return 'collateral';
      case DocumentType.GUARANTOR_DOCUMENT:
        return 'guarantor';
      case DocumentType.LOAN_AGREEMENT:
      case DocumentType.REPAYMENT_SCHEDULE:
      case DocumentType.LEGAL_DOCUMENT:
        return 'legal';
      default:
        return 'other';
    }
  }

  // Lifecycle hooks
  @BeforeInsert()
  async beforeInsert() {
    if (!this.documentNumber) {
      this.documentNumber = this.generateDocumentNumber();
    }
    
    if (!this.autoDeleteDate) {
      const deleteDate = new Date();
      deleteDate.setMonth(deleteDate.getMonth() + this.retentionPeriodMonths);
      this.autoDeleteDate = deleteDate;
    }
    
    if (this.status === DocumentStatus.UPLOADED && !this.uploadedAt) {
      this.uploadedAt = new Date();
    }
  }

  @BeforeUpdate()
  async beforeUpdate() {
    if (this.expiryDate && new Date() > this.expiryDate && this.status !== DocumentStatus.EXPIRED) {
      this.status = DocumentStatus.EXPIRED;
    }
  }

  @AfterInsert()
  async afterInsert() {
    console.log(`Loan document created: ${this.documentNumber} (${this.id})`);
  }

  @AfterUpdate()
  async afterUpdate() {
    console.log(`Loan document updated: ${this.documentNumber} (${this.id})`);
  }

  private generateDocumentNumber(): string {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DOC-${new Date().getFullYear()}-${timestamp}${random}`;
  }

  // Methods
  upload(
    fileName: string,
    fileSize: number,
    fileFormat: DocumentFormat,
    mimeType: string,
    storagePath: string,
    uploadedById: string,
    fileHash?: string,
    thumbnailPath?: string,
  ): void {
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.fileFormat = fileFormat;
    this.mimeType = mimeType;
    this.storagePath = storagePath;
    this.uploadedById = uploadedById;
    this.fileHash = fileHash;
    this.thumbnailPath = thumbnailPath;
    this.status = DocumentStatus.UPLOADED;
    this.uploadedAt = new Date();
  }

  verify(verifiedById: string, verificationMethod: VerificationMethod, verificationScore?: number): void {
    this.verifiedById = verifiedById;
    this.verificationMethod = verificationMethod;
    this.verificationScore = verificationScore;
    this.status = DocumentStatus.VERIFIED;
    this.verifiedAt = new Date();
    this.verificationStatus = 'verified';
  }

  reject(reason: string, rejectedById?: string): void {
    this.rejectionReason = reason;
    this.status = DocumentStatus.REJECTED;
    this.rejectedAt = new Date();
    if (rejectedById) {
      this.verifiedById = rejectedById;
    }
  }

  startReview(): void {
    if (this.status === DocumentStatus.UPLOADED) {
      this.status = DocumentStatus.UNDER_REVIEW;
      this.reviewStartDate = new Date();
    }
  }

  markAsExpired(): void {
    this.status = DocumentStatus.EXPIRED;
  }

  incrementView(userId?: string): void {
    this.viewCount += 1;
    this.lastViewedAt = new Date();
    if (userId) {
      this.lastViewedById = userId;
    }
  }

  incrementDownload(): void {
    this.downloadCount += 1;
  }

  // JSON serialization
  toJSON(): Partial<LoanDocument> {
    return {
      id: this.id,
      documentNumber: this.documentNumber,
      documentType: this.documentType,
      name: this.name,
      fileName: this.fileName,
      fileSize: this.fileSize,
      fileSizeFormatted: this.fileSizeFormatted,
      fileFormat: this.fileFormat,
      mimeType: this.mimeType,
      status: this.status,
      isVerified: this.isVerified,
      isRejected: this.isRejected,
      isExpired: this.isExpired,
      isValid: this.isValid,
      expiryDate: this.expiryDate,
      daysUntilExpiry: this.daysUntilExpiry,
      uploadedAt: this.uploadedAt,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}