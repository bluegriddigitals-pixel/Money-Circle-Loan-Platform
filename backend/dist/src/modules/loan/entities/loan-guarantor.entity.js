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
var LoanGuarantor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanGuarantor = exports.GuaranteeType = exports.RelationshipType = exports.GuarantorType = exports.GuarantorStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const loan_entity_1 = require("./loan.entity");
const loan_application_entity_1 = require("./loan-application.entity");
const loan_document_entity_1 = require("./loan-document.entity");
const user_entity_1 = require("../../user/entities/user.entity");
var GuarantorStatus;
(function (GuarantorStatus) {
    GuarantorStatus["PENDING"] = "pending";
    GuarantorStatus["INVITED"] = "invited";
    GuarantorStatus["ACCEPTED"] = "accepted";
    GuarantorStatus["DECLINED"] = "declined";
    GuarantorStatus["VERIFIED"] = "verified";
    GuarantorStatus["ACTIVE"] = "active";
    GuarantorStatus["RELEASED"] = "released";
    GuarantorStatus["TERMINATED"] = "terminated";
})(GuarantorStatus || (exports.GuarantorStatus = GuarantorStatus = {}));
var GuarantorType;
(function (GuarantorType) {
    GuarantorType["PERSONAL"] = "personal";
    GuarantorType["CORPORATE"] = "corporate";
    GuarantorType["INSTITUTIONAL"] = "institutional";
})(GuarantorType || (exports.GuarantorType = GuarantorType = {}));
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["FAMILY_MEMBER"] = "family_member";
    RelationshipType["FRIEND"] = "friend";
    RelationshipType["BUSINESS_PARTNER"] = "business_partner";
    RelationshipType["EMPLOYER"] = "employer";
    RelationshipType["COLLEAGUE"] = "colleague";
    RelationshipType["OTHER"] = "other";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
var GuaranteeType;
(function (GuaranteeType) {
    GuaranteeType["FULL"] = "full";
    GuaranteeType["PARTIAL"] = "partial";
    GuaranteeType["JOINT"] = "joint";
    GuaranteeType["SEVERAL"] = "several";
})(GuaranteeType || (exports.GuaranteeType = GuaranteeType = {}));
let LoanGuarantor = LoanGuarantor_1 = class LoanGuarantor {
    get fullName() {
        return `${this.firstName}${this.middleName ? ` ${this.middleName}` : ''} ${this.lastName}`;
    }
    get age() {
        if (!this.dateOfBirth)
            return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    get totalAnnualIncome() {
        return this.annualIncome + (this.additionalAnnualIncome || 0);
    }
    get debtToIncomeRatio() {
        if (!this.monthlyDebt || this.totalAnnualIncome <= 0)
            return null;
        const annualDebt = this.monthlyDebt * 12;
        return annualDebt / this.totalAnnualIncome;
    }
    get isActive() {
        return this.status === GuarantorStatus.ACTIVE;
    }
    get isInvitationExpired() {
        if (!this.invitationExpiry)
            return false;
        return new Date() > this.invitationExpiry;
    }
    get canBeInvited() {
        return !this.invitationToken || this.isInvitationExpired;
    }
    get hasAccepted() {
        return !!this.acceptedAt && this.status === GuarantorStatus.ACCEPTED;
    }
    generateGuarantorNumber() {
        if (!this.guarantorNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            this.guarantorNumber = `GUA-${year}-${random}`;
        }
        this.email = this.email.toLowerCase().trim();
        this.phoneNumber = this.phoneNumber.replace(/\s/g, '').replace(/^0/, '+');
        if (this.alternatePhoneNumber) {
            this.alternatePhoneNumber = this.alternatePhoneNumber.replace(/\s/g, '').replace(/^0/, '+');
        }
    }
    updateCalculatedFields() {
        if (this.totalAssets !== undefined || this.totalLiabilities !== undefined) {
            const assets = this.totalAssets || 0;
            const liabilities = this.totalLiabilities || 0;
            this.netWorth = assets - liabilities;
        }
        this.version += 1;
        if (this.status === GuarantorStatus.ACTIVE && !this.activatedAt) {
            this.activatedAt = new Date();
        }
    }
    invite(invitationToken, expiryHours = 72) {
        if (this.status !== GuarantorStatus.PENDING) {
            throw new Error(`Cannot invite guarantor with status: ${this.status}`);
        }
        this.invitationToken = invitationToken;
        this.invitationExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
        this.invitedAt = new Date();
        this.status = GuarantorStatus.INVITED;
    }
    accept() {
        if (this.status !== GuarantorStatus.INVITED) {
            throw new Error(`Cannot accept guarantor with status: ${this.status}`);
        }
        if (this.isInvitationExpired) {
            throw new Error('Invitation has expired');
        }
        this.acceptedAt = new Date();
        this.status = GuarantorStatus.ACCEPTED;
        this.invitationToken = null;
    }
    decline(reason) {
        if (this.status !== GuarantorStatus.INVITED) {
            throw new Error(`Cannot decline guarantor with status: ${this.status}`);
        }
        this.declinedAt = new Date();
        this.declineReason = reason;
        this.status = GuarantorStatus.DECLINED;
        this.invitationToken = null;
    }
    verify(method, notes) {
        if (this.status !== GuarantorStatus.ACCEPTED) {
            throw new Error(`Cannot verify guarantor with status: ${this.status}`);
        }
        this.verifiedAt = new Date();
        this.verificationMethod = method;
        this.verificationNotes = notes;
        this.status = GuarantorStatus.VERIFIED;
    }
    activate() {
        if (this.status !== GuarantorStatus.VERIFIED) {
            throw new Error(`Cannot activate guarantor with status: ${this.status}`);
        }
        this.activatedAt = new Date();
        this.status = GuarantorStatus.ACTIVE;
    }
    release(reason) {
        if (this.status !== GuarantorStatus.ACTIVE) {
            throw new Error(`Cannot release guarantor with status: ${this.status}`);
        }
        this.releasedAt = new Date();
        this.releaseReason = reason;
        this.status = GuarantorStatus.RELEASED;
    }
    terminate(reason) {
        this.terminatedAt = new Date();
        this.terminationReason = reason;
        this.status = GuarantorStatus.TERMINATED;
    }
    signAgreement(documentPath) {
        this.agreementSignedAt = new Date();
        this.agreementDocumentPath = documentPath;
    }
    get isValid() {
        return (this.firstName &&
            this.lastName &&
            this.email &&
            this.phoneNumber &&
            this.occupation &&
            this.annualIncome > 0);
    }
    get isEligible() {
        const minAge = 18;
        const maxAge = 65;
        const minIncome = 20000;
        const minCreditScore = 600;
        if (this.age && (this.age < minAge || this.age > maxAge))
            return false;
        if (this.totalAnnualIncome < minIncome)
            return false;
        if (this.creditScore && this.creditScore < minCreditScore)
            return false;
        if (this.debtToIncomeRatio && this.debtToIncomeRatio > 0.5)
            return false;
        return true;
    }
    get riskLevel() {
        if (!this.riskScore) {
            if (this.creditScore && this.creditScore >= 750)
                return 'low';
            if (this.creditScore && this.creditScore >= 650)
                return 'medium';
            return 'high';
        }
        if (this.riskScore >= 80)
            return 'low';
        if (this.riskScore >= 60)
            return 'medium';
        return 'high';
    }
    static createPersonalGuarantor(data) {
        const guarantor = new LoanGuarantor_1();
        Object.assign(guarantor, data);
        guarantor.guarantorType = GuarantorType.PERSONAL;
        return guarantor;
    }
    static createCorporateGuarantor(data) {
        const guarantor = new LoanGuarantor_1();
        Object.assign(guarantor, data);
        guarantor.guarantorType = GuarantorType.CORPORATE;
        return guarantor;
    }
    updateFinancialInfo(financialData) {
        Object.assign(this, financialData);
        this.updateCalculatedFields();
    }
    addCollateral(collateral) {
        if (!this.providedCollateral) {
            this.providedCollateral = [];
        }
        this.providedCollateral.push(collateral);
    }
    removeCollateral(index) {
        if (this.providedCollateral && index >= 0 && index < this.providedCollateral.length) {
            this.providedCollateral.splice(index, 1);
        }
    }
    addRiskFactor(factor) {
        if (!this.riskFactors) {
            this.riskFactors = [];
        }
        if (!this.riskFactors.includes(factor)) {
            this.riskFactors.push(factor);
        }
    }
    removeRiskFactor(factor) {
        if (this.riskFactors) {
            const index = this.riskFactors.indexOf(factor);
            if (index > -1) {
                this.riskFactors.splice(index, 1);
            }
        }
    }
    addTag(tag) {
        if (!this.tags) {
            this.tags = [];
        }
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
    removeTag(tag) {
        if (this.tags) {
            const index = this.tags.indexOf(tag);
            if (index > -1) {
                this.tags.splice(index, 1);
            }
        }
    }
    toJSON() {
        return {
            id: this.id,
            guarantorNumber: this.guarantorNumber,
            fullName: this.fullName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            status: this.status,
            guarantorType: this.guarantorType,
            relationship: this.relationship,
            occupation: this.occupation,
            annualIncome: this.annualIncome,
            totalAnnualIncome: this.totalAnnualIncome,
            creditScore: this.creditScore,
            guaranteeType: this.guaranteeType,
            guaranteeAmount: this.guaranteeAmount,
            guaranteePercentage: this.guaranteePercentage,
            riskLevel: this.riskLevel,
            isActive: this.isActive,
            isValid: this.isValid,
            isEligible: this.isEligible,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.LoanGuarantor = LoanGuarantor;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the guarantor',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique guarantor reference number',
        example: 'GUA-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "guarantorNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan (if associated with a loan)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan application (if associated with an application)',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "loanApplicationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the user (if guarantor is a registered user)',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Guarantor type',
        enum: GuarantorType,
        example: GuarantorType.PERSONAL,
        default: GuarantorType.PERSONAL,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GuarantorType,
        default: GuarantorType.PERSONAL,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(GuarantorType),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "guarantorType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name',
        example: 'Jane',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name',
        example: 'Smith',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Middle name',
        example: 'Marie',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'jane.smith@example.com',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number',
        example: '+1234567890',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: false }),
    (0, class_validator_1.IsPhoneNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.replace(/\s/g, '').replace(/^0/, '+')),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alternate phone number',
        example: '+0987654321',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "alternatePhoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Date of birth',
        example: '1985-05-15',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'National ID number',
        example: 'A123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "nationalId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Passport number',
        example: 'P12345678',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "passportNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax ID number',
        example: 'T123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "taxId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Relationship to borrower',
        enum: RelationshipType,
        example: RelationshipType.FAMILY_MEMBER,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RelationshipType,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(RelationshipType),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed relationship description',
        example: 'Sister of the borrower',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "relationshipDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Years known',
        example: 10,
        minimum: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "yearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Occupation',
        example: 'Software Engineer',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Company/employer name',
        example: 'Tech Solutions Inc.',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "employer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Job title/position',
        example: 'Senior Developer',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Employment duration in months',
        example: 60,
        minimum: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "employmentDurationMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Annual income',
        example: 75000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "annualIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional annual income sources',
        example: 15000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "additionalAnnualIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total assets value',
        example: 300000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "totalAssets", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total liabilities',
        example: 100000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "totalLiabilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Net worth (assets - liabilities)',
        example: 200000.0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "netWorth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monthly expenses',
        example: 3000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "monthlyExpenses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monthly debt obligations',
        example: 1000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "monthlyDebt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Credit score',
        example: 750,
        minimum: 300,
        maximum: 850,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Credit bureau report data',
        example: {
            bureau: 'Equifax',
            reportDate: '2024-01-15',
            scoreFactors: ['payment_history', 'credit_utilization'],
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "creditReport", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Guarantee type',
        enum: GuaranteeType,
        example: GuaranteeType.FULL,
        default: GuaranteeType.FULL,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GuaranteeType,
        default: GuaranteeType.FULL,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(GuaranteeType),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "guaranteeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantee amount (for partial guarantee)',
        example: 25000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "guaranteeAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantee percentage (for partial guarantee)',
        example: 50.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "guaranteePercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum liability amount',
        example: 50000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "maxLiability", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral provided by guarantor',
        example: [
            { type: 'savings_account', value: 20000, description: 'Bank savings' },
        ],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanGuarantor.prototype, "providedCollateral", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Guarantor status',
        enum: GuarantorStatus,
        example: GuarantorStatus.PENDING,
        default: GuarantorStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GuarantorStatus,
        default: GuarantorStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(GuarantorStatus),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Invitation date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "invitedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Invitation token',
        example: 'invite_token_123456',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "invitationToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Invitation expiry date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "invitationExpiry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Acceptance date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "acceptedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Declined date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "declinedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Decline reason',
        example: 'Not comfortable with the risk',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "declineReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification method',
        example: 'document_verification',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "verificationMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Verification notes',
        example: 'Documents verified and credit check completed',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "verificationNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Activation date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "activatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "releasedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release reason',
        example: 'Loan fully repaid',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "releaseReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Termination date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "terminatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Termination reason',
        example: 'Guarantor requested removal',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "terminationReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantor agreement signed date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "agreementSignedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantor agreement document storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/guarantor_agreement.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "agreementDocumentPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Address information',
        example: {
            street: '456 Oak Avenue',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Emergency contact information',
        example: {
            name: 'John Smith',
            relationship: 'Spouse',
            phone: '+1122334455',
            email: 'john.smith@example.com',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "emergencyContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bank account information (for repayments)',
        example: {
            bankName: 'First National Bank',
            accountNumber: '1234567890',
            routingNumber: '021000021',
            accountType: 'checking',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "bankAccount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk assessment score (0-100)',
        example: 80.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "riskScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk factors',
        example: ['high_debt_to_income', 'recent_credit_inquiry'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanGuarantor.prototype, "riskFactors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes/comments',
        example: 'Guarantor has stable employment and good credit history',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
        example: 'Requires additional income verification',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantor.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for categorization',
        example: ['primary', 'verified', 'high_income'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanGuarantor.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Communication preferences',
        example: {
            email: true,
            sms: true,
            phone: false,
            mail: false,
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "communicationPreferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { customField1: 'value1', customField2: 'value2' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanGuarantor.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Guarantor creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], LoanGuarantor.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Version for optimistic locking',
        example: 1,
        default: 1,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 1, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanGuarantor.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan associated with this guarantor',
        type: () => loan_entity_1.Loan,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.guarantors, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], LoanGuarantor.prototype, "loan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan application associated with this guarantor',
        type: () => loan_application_entity_1.LoanApplication,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_application_entity_1.LoanApplication, (loanApplication) => loanApplication.guarantors, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanApplicationId' }),
    __metadata("design:type", loan_application_entity_1.LoanApplication)
], LoanGuarantor.prototype, "loanApplication", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User account associated with this guarantor',
        type: () => user_entity_1.User,
    }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.guarantors, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], LoanGuarantor.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Documents uploaded for this guarantor',
        type: () => [loan_document_entity_1.LoanDocument],
    }),
    (0, typeorm_1.OneToMany)(() => loan_document_entity_1.LoanDocument, (document) => document.guarantor),
    __metadata("design:type", Array)
], LoanGuarantor.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name of guarantor',
        example: 'Jane Marie Smith',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "fullName", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Age of guarantor',
        example: 38,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "age", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total annual income including additional income',
        example: 90000.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "totalAnnualIncome", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Debt-to-income ratio',
        example: 0.2,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "debtToIncomeRatio", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is guarantor currently active',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "isActive", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is guarantor invitation expired',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "isInvitationExpired", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Can guarantor be invited',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "canBeInvited", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Has guarantor accepted the invitation',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "hasAccepted", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoanGuarantor.prototype, "generateGuarantorNumber", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoanGuarantor.prototype, "updateCalculatedFields", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "isValid", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "isEligible", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], LoanGuarantor.prototype, "riskLevel", null);
exports.LoanGuarantor = LoanGuarantor = LoanGuarantor_1 = __decorate([
    (0, typeorm_1.Entity)('loan_guarantors'),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['loanApplicationId']),
    (0, typeorm_1.Index)(['userId'], { unique: true, where: 'user_id IS NOT NULL' }),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['phoneNumber']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], LoanGuarantor);
//# sourceMappingURL=loan-guarantor.entity.js.map