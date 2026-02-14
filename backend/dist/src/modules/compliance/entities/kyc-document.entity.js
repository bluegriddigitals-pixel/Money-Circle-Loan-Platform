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
exports.KycDocument = exports.KycDocumentStatus = exports.KycDocumentType = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const kyc_entity_1 = require("./kyc.entity");
var KycDocumentType;
(function (KycDocumentType) {
    KycDocumentType["PASSPORT"] = "passport";
    KycDocumentType["DRIVERS_LICENSE"] = "drivers_license";
    KycDocumentType["NATIONAL_ID"] = "national_id";
    KycDocumentType["RESIDENCE_PERMIT"] = "residence_permit";
    KycDocumentType["UTILITY_BILL"] = "utility_bill";
    KycDocumentType["BANK_STATEMENT"] = "bank_statement";
    KycDocumentType["TAX_RETURN"] = "tax_return";
    KycDocumentType["INCORPORATION_CERTIFICATE"] = "incorporation_certificate";
    KycDocumentType["ARTICLES_OF_ASSOCIATION"] = "articles_of_association";
    KycDocumentType["PROOF_OF_ADDRESS"] = "proof_of_address";
    KycDocumentType["SELFIE"] = "selfie";
    KycDocumentType["OTHER"] = "other";
})(KycDocumentType || (exports.KycDocumentType = KycDocumentType = {}));
var KycDocumentStatus;
(function (KycDocumentStatus) {
    KycDocumentStatus["PENDING"] = "pending";
    KycDocumentStatus["UPLOADED"] = "uploaded";
    KycDocumentStatus["VERIFIED"] = "verified";
    KycDocumentStatus["REJECTED"] = "rejected";
    KycDocumentStatus["EXPIRED"] = "expired";
})(KycDocumentStatus || (exports.KycDocumentStatus = KycDocumentStatus = {}));
let KycDocument = class KycDocument {
    get isVerified() {
        return this.status === KycDocumentStatus.VERIFIED;
    }
    get isRejected() {
        return this.status === KycDocumentStatus.REJECTED;
    }
    get isExpired() {
        if (!this.expiryDate)
            return false;
        return new Date() > this.expiryDate;
    }
    get isUploaded() {
        return this.status === KycDocumentStatus.UPLOADED;
    }
    get isPending() {
        return this.status === KycDocumentStatus.PENDING;
    }
    get fileExtension() {
        if (!this.fileName)
            return '';
        const parts = this.fileName.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }
    get fileSizeFormatted() {
        if (!this.fileSize)
            return '0 Bytes';
        const bytes = this.fileSize;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }
    get daysUntilExpiry() {
        if (!this.expiryDate)
            return null;
        const today = new Date();
        const expiry = new Date(this.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};
exports.KycDocument = KycDocument;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the document',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], KycDocument.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'KYC ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], KycDocument.prototype, "kycId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document type',
        enum: KycDocumentType,
        example: KycDocumentType.PASSPORT,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: KycDocumentType,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(KycDocumentType),
    __metadata("design:type", String)
], KycDocument.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document status',
        enum: KycDocumentStatus,
        example: KycDocumentStatus.UPLOADED,
        default: KycDocumentStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: KycDocumentStatus,
        default: KycDocumentStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(KycDocumentStatus),
    __metadata("design:type", String)
], KycDocument.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document name',
        example: 'passport.jpg',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], KycDocument.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File name',
        example: 'passport_john_doe_2024.jpg',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], KycDocument.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File path',
        example: '/uploads/kyc/passport_123.jpg',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], KycDocument.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 1048576,
    }),
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], KycDocument.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type',
        example: 'image/jpeg',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], KycDocument.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document number',
        example: 'A12345678',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KycDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Issue date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expiry date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Country of issue',
        example: 'US',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KycDocument.prototype, "countryOfIssue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Uploaded at',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verified at',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verified by',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], KycDocument.prototype, "verifiedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejected at',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejected by',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], KycDocument.prototype, "rejectedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection reason',
        example: 'Document is blurry',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KycDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes',
        example: 'Document verified successfully',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KycDocument.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is front side',
        example: true,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KycDocument.prototype, "isFrontSide", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Extracted data',
        example: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], KycDocument.prototype, "extractedData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Metadata',
        example: { ocrConfidence: 0.95 },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], KycDocument.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], KycDocument.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => kyc_entity_1.Kyc, (kyc) => kyc.documents, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'kycId' }),
    __metadata("design:type", kyc_entity_1.Kyc)
], KycDocument.prototype, "kyc", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "isVerified", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "isRejected", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "isExpired", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "isUploaded", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "isPending", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "fileExtension", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "fileSizeFormatted", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], KycDocument.prototype, "daysUntilExpiry", null);
exports.KycDocument = KycDocument = __decorate([
    (0, typeorm_1.Entity)('kyc_documents'),
    (0, typeorm_1.Index)(['kycId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['type'])
], KycDocument);
//# sourceMappingURL=kyc-document.entity.js.map