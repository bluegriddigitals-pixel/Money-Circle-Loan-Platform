"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanDocument = exports.VerificationMethod = exports.DocumentFormat = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const loan_entity_1 = require("./loan.entity");
const loan_application_entity_1 = require("./loan-application.entity");
const loan_guarantor_entity_1 = require("./loan-guarantor.entity");
const loan_collateral_entity_1 = require("./loan-collateral.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["IDENTITY_PROOF"] = "identity_proof";
    DocumentType["ADDRESS_PROOF"] = "address_proof";
    DocumentType["INCOME_PROOF"] = "income_proof";
    DocumentType["BANK_STATEMENT"] = "bank_statement";
    DocumentType["TAX_RETURN"] = "tax_return";
    DocumentType["BUSINESS_REGISTRATION"] = "business_registration";
    DocumentType["COLLATERAL_DOCUMENT"] = "collateral_document";
    DocumentType["GUARANTOR_DOCUMENT"] = "guarantor_document";
    DocumentType["LOAN_AGREEMENT"] = "loan_agreement";
    DocumentType["REPAYMENT_SCHEDULE"] = "repayment_schedule";
    DocumentType["DISBURSEMENT_PROOF"] = "disbursement_proof";
    DocumentType["PAYMENT_RECEIPT"] = "payment_receipt";
    DocumentType["LEGAL_DOCUMENT"] = "legal_document";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING_UPLOAD"] = "pending_upload";
    DocumentStatus["UPLOADED"] = "uploaded";
    DocumentStatus["UNDER_REVIEW"] = "under_review";
    DocumentStatus["VERIFIED"] = "verified";
    DocumentStatus["REJECTED"] = "rejected";
    DocumentStatus["EXPIRED"] = "expired";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var DocumentFormat;
(function (DocumentFormat) {
    DocumentFormat["PDF"] = "pdf";
    DocumentFormat["JPEG"] = "jpeg";
    DocumentFormat["PNG"] = "png";
    DocumentFormat["DOC"] = "doc";
    DocumentFormat["DOCX"] = "docx";
    DocumentFormat["XLS"] = "xls";
    DocumentFormat["XLSX"] = "xlsx";
    DocumentFormat["TXT"] = "txt";
})(DocumentFormat || (exports.DocumentFormat = DocumentFormat = {}));
var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["MANUAL"] = "manual";
    VerificationMethod["AUTOMATED"] = "automated";
    VerificationMethod["THIRD_PARTY"] = "third_party";
})(VerificationMethod || (exports.VerificationMethod = VerificationMethod = {}));
let LoanDocument = class LoanDocument {
    get fileSizeFormatted() {
        const bytes = this.fileSize;
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    get isUploaded() {
        return this.status === DocumentStatus.UPLOADED;
    }
    get isVerified() {
        return this.status === DocumentStatus.VERIFIED;
    }
    get isRejected() {
        return this.status === DocumentStatus.REJECTED;
    }
    get isUnderReview() {
        return this.status === DocumentStatus.UNDER_REVIEW;
    }
    get isExpired() {
        return this.status === DocumentStatus.EXPIRED ||
            (this.expiryDate && new Date() > this.expiryDate);
    }
    get daysUntilExpiry() {
        if (!this.expiryDate)
            return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(this.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get ageInDays() {
        if (!this.createdAt)
            return 0;
        const today = new Date();
        const created = new Date(this.createdAt);
        const diffTime = Math.abs(today.getTime() - created.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    get needsReview() {
        return this.isUploaded && !this.isVerified && !this.isRejected && !this.isUnderReview;
    }
    get isValid() {
        return this.isVerified && !this.isExpired;
    }
    get category() {
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
    async beforeUpdate() {
        if (this.expiryDate && new Date() > this.expiryDate && this.status !== DocumentStatus.EXPIRED) {
            this.status = DocumentStatus.EXPIRED;
        }
    }
    async afterInsert() {
        console.log(`Loan document created: ${this.documentNumber} (${this.id})`);
    }
    async afterUpdate() {
        console.log(`Loan document updated: ${this.documentNumber} (${this.id})`);
    }
    generateDocumentNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `DOC-${new Date().getFullYear()}-${timestamp}${random}`;
    }
    upload(fileName, fileSize, fileFormat, mimeType, storagePath, uploadedById, fileHash, thumbnailPath) {
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
    verify(verifiedById, verificationMethod, verificationScore) {
        this.verifiedById = verifiedById;
        this.verificationMethod = verificationMethod;
        this.verificationScore = verificationScore;
        this.status = DocumentStatus.VERIFIED;
        this.verifiedAt = new Date();
        this.verificationStatus = 'verified';
    }
    reject(reason, rejectedById) {
        this.rejectionReason = reason;
        this.status = DocumentStatus.REJECTED;
        this.rejectedAt = new Date();
        if (rejectedById) {
            this.verifiedById = rejectedById;
        }
    }
    startReview() {
        if (this.status === DocumentStatus.UPLOADED) {
            this.status = DocumentStatus.UNDER_REVIEW;
            this.reviewStartDate = new Date();
        }
    }
    markAsExpired() {
        this.status = DocumentStatus.EXPIRED;
    }
    incrementView(userId) {
        this.viewCount += 1;
        this.lastViewedAt = new Date();
        if (userId) {
            this.lastViewedById = userId;
        }
    }
    incrementDownload() {
        this.downloadCount += 1;
    }
    toJSON() {
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
};
exports.LoanDocument = LoanDocument;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the document',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique document reference number',
        example: 'DOC-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan (if associated with a loan)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan application (if associated with an application)',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "loanApplicationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the guarantor (if associated with a guarantor)',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "guarantorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the collateral (if associated with collateral)',
        example: '123e4567-e89b-12d3-a456-426614174004',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "collateralId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document type',
        enum: DocumentType,
        example: DocumentType.IDENTITY_PROOF,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentType,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(DocumentType),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document name/title',
        example: 'Passport - John Doe',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], LoanDocument.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document description',
        example: 'Bio-data page of passport showing photo and personal details',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], LoanDocument.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document file name',
        example: 'passport_john_doe_2024.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], LoanDocument.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 2048576,
        minimum: 1,
    }),
    (0, typeorm_1.Column)({ type: 'bigint', nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanDocument.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File format/extension',
        enum: DocumentFormat,
        example: DocumentFormat.PDF,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentFormat,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(DocumentFormat),
    __metadata("design:type", String)
], LoanDocument.prototype, "fileFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File MIME type',
        example: 'application/pdf',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanDocument.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Storage path/URL',
        example: 'https://s3.amazonaws.com/bucket/documents/passport.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "storagePath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Thumbnail URL (for images/PDFs)',
        example: 'https://s3.amazonaws.com/bucket/thumbnails/passport_thumb.jpg',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "thumbnailPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document hash (for integrity verification)',
        example: 'a1b2c3d4e5f6789012345678901234567890abcd',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], LoanDocument.prototype, "fileHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document status',
        enum: DocumentStatus,
        example: DocumentStatus.UPLOADED,
        default: DocumentStatus.PENDING_UPLOAD,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING_UPLOAD,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(DocumentStatus),
    __metadata("design:type", String)
], LoanDocument.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification status',
        example: 'pending',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "verificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification method',
        enum: VerificationMethod,
        example: VerificationMethod.MANUAL,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VerificationMethod,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VerificationMethod),
    __metadata("design:type", String)
], LoanDocument.prototype, "verificationMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification score/confidence (0-100)',
        example: 95.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanDocument.prototype, "verificationScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification details/results',
        example: {
            name_match: true,
            date_of_birth_match: true,
            document_validity: 'valid',
            issue_date: '2020-01-15',
            expiry_date: '2030-01-15',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanDocument.prototype, "verificationDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection reason (if rejected)',
        example: 'Document is blurry and unreadable',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], LoanDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
        example: 'Document requires manual verification due to poor image quality',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for categorization',
        example: ['primary', 'urgent', 'requires_review'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanDocument.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document metadata',
        example: {
            pages: 2,
            resolution: '300dpi',
            color_mode: 'color',
            language: 'en',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanDocument.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'OCR/extracted text data',
        example: 'JOHN DOE\nDATE OF BIRTH: 1990-01-01\n...',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanDocument.prototype, "extractedText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'OCR confidence score',
        example: 0.85,
        minimum: 0,
        maximum: 1,
    }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], LoanDocument.prototype, "ocrConfidence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document expiry date',
        example: '2030-01-15',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Issue date',
        example: '2020-01-15',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document number (as shown on document)',
        example: 'A12345678',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentNumberOnFile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Issuing authority/country',
        example: 'United States Department of State',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], LoanDocument.prototype, "issuingAuthority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Issuing country code (ISO 3166-1 alpha-2)',
        example: 'US',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(2),
    __metadata("design:type", String)
], LoanDocument.prototype, "issuingCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether document is required',
        example: true,
        default: true,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoanDocument.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether document is sensitive/confidential',
        example: true,
        default: false,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoanDocument.prototype, "isConfidential", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether document is shared with third parties',
        example: false,
        default: false,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoanDocument.prototype, "isShared", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Third parties with whom document is shared',
        example: ['credit_bureau', 'insurance_company'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanDocument.prototype, "sharedWith", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Retention period in months',
        example: 84,
        default: 84,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 84, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanDocument.prototype, "retentionPeriodMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Auto-delete date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "autoDeleteDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of user who uploaded the document',
        example: '123e4567-e89b-12d3-a456-426614174005',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "uploadedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Upload date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of user who verified the document',
        example: '123e4567-e89b-12d3-a456-426614174006',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "verifiedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Review start date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "reviewStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Review end date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "reviewEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last viewed date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanDocument.prototype, "lastViewedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last viewed by user ID',
        example: '123e4567-e89b-12d3-a456-426614174007',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanDocument.prototype, "lastViewedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Download count',
        example: 3,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanDocument.prototype, "downloadCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'View count',
        example: 5,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanDocument.prototype, "viewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanDocument.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], LoanDocument.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan associated with this document',
        type: () => loan_entity_1.Loan,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.documents, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_entity_1.Loan),
    __metadata("design:type", loan_entity_1.Loan)
], LoanDocument.prototype, "loan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan application associated with this document',
        type: () => loan_application_entity_1.LoanApplication,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_application_entity_1.LoanApplication, (application) => application.documents, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanApplicationId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_application_entity_1.LoanApplication),
    __metadata("design:type", loan_application_entity_1.LoanApplication)
], LoanDocument.prototype, "loanApplication", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantor associated with this document',
        type: () => loan_guarantor_entity_1.LoanGuarantor,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_guarantor_entity_1.LoanGuarantor, (guarantor) => guarantor.documents, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'guarantorId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_guarantor_entity_1.LoanGuarantor),
    __metadata("design:type", loan_guarantor_entity_1.LoanGuarantor)
], LoanDocument.prototype, "guarantor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral associated with this document',
        type: () => loan_collateral_entity_1.LoanCollateral,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_collateral_entity_1.LoanCollateral, (collateral) => collateral.documents, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'collateralId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_collateral_entity_1.LoanCollateral),
    __metadata("design:type", loan_collateral_entity_1.LoanCollateral)
], LoanDocument.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in human-readable format',
        example: '2.0 MB',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "fileSizeFormatted", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is uploaded',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isUploaded", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is verified',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isVerified", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is rejected',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isRejected", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is under review',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isUnderReview", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is expired',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isExpired", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days until expiry (negative if expired)',
        example: 365,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "daysUntilExpiry", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document age in days',
        example: 5,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "ageInDays", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document needs review',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "needsReview", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether document is valid (verified and not expired)',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "isValid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document category',
        example: 'identity',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], LoanDocument.prototype, "category", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanDocument.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanDocument.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanDocument.prototype, "afterInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanDocument.prototype, "afterUpdate", null);
exports.LoanDocument = LoanDocument = __decorate([
    (0, typeorm_1.Entity)('loan_documents'),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['loanApplicationId']),
    (0, typeorm_1.Index)(['guarantorId']),
    (0, typeorm_1.Index)(['collateralId']),
    (0, typeorm_1.Index)(['documentType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['uploadedById']),
    (0, typeorm_1.Index)(['verifiedById']),
    (0, typeorm_1.Index)(['createdAt'])
], LoanDocument);
//# sourceMappingURL=loan-document.entity.js.map