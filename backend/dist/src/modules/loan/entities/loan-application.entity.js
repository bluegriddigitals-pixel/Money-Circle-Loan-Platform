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
exports.LoanApplication = exports.EmploymentStatus = exports.LoanPurpose = exports.LoanApplicationStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const user_entity_1 = require("../../user/entities/user.entity");
const loan_entity_1 = require("./loan.entity");
const loan_document_entity_1 = require("./loan-document.entity");
const loan_collateral_entity_1 = require("./loan-collateral.entity");
const loan_guarantor_entity_1 = require("./loan-guarantor.entity");
var LoanApplicationStatus;
(function (LoanApplicationStatus) {
    LoanApplicationStatus["DRAFT"] = "draft";
    LoanApplicationStatus["SUBMITTED"] = "submitted";
    LoanApplicationStatus["UNDER_REVIEW"] = "under_review";
    LoanApplicationStatus["APPROVED"] = "approved";
    LoanApplicationStatus["REJECTED"] = "rejected";
    LoanApplicationStatus["CANCELLED"] = "cancelled";
    LoanApplicationStatus["PENDING_DOCUMENTS"] = "pending_documents";
    LoanApplicationStatus["CONDITIONALLY_APPROVED"] = "conditionally_approved";
})(LoanApplicationStatus || (exports.LoanApplicationStatus = LoanApplicationStatus = {}));
var LoanPurpose;
(function (LoanPurpose) {
    LoanPurpose["PERSONAL"] = "personal";
    LoanPurpose["BUSINESS"] = "business";
    LoanPurpose["EDUCATION"] = "education";
    LoanPurpose["HOME"] = "home";
    LoanPurpose["AUTO"] = "auto";
    LoanPurpose["DEBT_CONSOLIDATION"] = "debt_consolidation";
    LoanPurpose["OTHER"] = "other";
})(LoanPurpose || (exports.LoanPurpose = LoanPurpose = {}));
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["EMPLOYED"] = "employed";
    EmploymentStatus["SELF_EMPLOYED"] = "self_employed";
    EmploymentStatus["UNEMPLOYED"] = "unemployed";
    EmploymentStatus["RETIRED"] = "retired";
    EmploymentStatus["STUDENT"] = "student";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
let LoanApplication = class LoanApplication {
    generateApplicationNumber() {
        if (!this.applicationNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0");
            this.applicationNumber = `LA-${year}-${random}`;
        }
    }
    updateVersion() {
        this.version += 1;
    }
    get isExpired() {
        if (!this.expiresAt)
            return false;
        return new Date() > this.expiresAt;
    }
    get isComplete() {
        return !!(this.requestedAmount &&
            this.requestedTerm &&
            this.purpose &&
            this.userId);
    }
    get daysSinceSubmission() {
        if (!this.submittedAt)
            return null;
        const today = new Date();
        const submitted = new Date(this.submittedAt);
        const diffTime = today.getTime() - submitted.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    submit() {
        if (this.status !== LoanApplicationStatus.DRAFT) {
            throw new Error("Only draft applications can be submitted");
        }
        this.status = LoanApplicationStatus.SUBMITTED;
        this.submittedAt = new Date();
    }
    approve(amount, term, rate, approvedBy) {
        if (this.status !== LoanApplicationStatus.SUBMITTED &&
            this.status !== LoanApplicationStatus.UNDER_REVIEW) {
            throw new Error("Application must be submitted or under review to approve");
        }
        this.status = LoanApplicationStatus.APPROVED;
        this.approvedAmount = amount;
        this.approvedTerm = term;
        this.offeredRate = rate;
        this.decisionedBy = approvedBy;
        this.decisionedAt = new Date();
    }
    reject(reason, rejectedBy) {
        this.status = LoanApplicationStatus.REJECTED;
        this.decisionReason = reason;
        this.decisionedBy = rejectedBy;
        this.decisionedAt = new Date();
    }
    cancel() {
        this.status = LoanApplicationStatus.CANCELLED;
    }
};
exports.LoanApplication = LoanApplication;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique identifier for the loan application",
        example: "123e4567-e89b-12d3-a456-426614174000",
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], LoanApplication.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique application number",
        example: "LA-2024-001234",
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanApplication.prototype, "applicationNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "User ID who submitted the application",
        example: "123e4567-e89b-12d3-a456-426614174001",
    }),
    (0, typeorm_1.Column)({ type: "uuid", nullable: false }),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], LoanApplication.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Loan ID if application is approved",
        example: "123e4567-e89b-12d3-a456-426614174002",
    }),
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], LoanApplication.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Loan application status",
        enum: LoanApplicationStatus,
        example: LoanApplicationStatus.SUBMITTED,
        default: LoanApplicationStatus.DRAFT,
    }),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LoanApplicationStatus,
        default: LoanApplicationStatus.DRAFT,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(LoanApplicationStatus),
    __metadata("design:type", String)
], LoanApplication.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Loan purpose",
        enum: LoanPurpose,
        example: LoanPurpose.PERSONAL,
    }),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LoanPurpose,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(LoanPurpose),
    __metadata("design:type", String)
], LoanApplication.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Loan amount requested",
        example: 50000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanApplication.prototype, "requestedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Loan term in months",
        example: 36,
        minimum: 1,
        maximum: 360,
    }),
    (0, typeorm_1.Column)({ type: "int", nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    __metadata("design:type", Number)
], LoanApplication.prototype, "requestedTerm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Interest rate offered",
        example: 12.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanApplication.prototype, "offeredRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Approved amount",
        example: 45000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanApplication.prototype, "approvedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Approved term in months",
        example: 36,
        minimum: 1,
        maximum: 360,
    }),
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    __metadata("design:type", Number)
], LoanApplication.prototype, "approvedTerm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Employment status",
        enum: EmploymentStatus,
        example: EmploymentStatus.EMPLOYED,
    }),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EmploymentStatus,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EmploymentStatus),
    __metadata("design:type", String)
], LoanApplication.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Annual income",
        example: 75000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanApplication.prototype, "annualIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Monthly expenses",
        example: 3000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanApplication.prototype, "monthlyExpenses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Credit score at time of application",
        example: 720,
        minimum: 300,
        maximum: 850,
    }),
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    __metadata("design:type", Number)
], LoanApplication.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Risk assessment score",
        example: 65,
        minimum: 0,
        maximum: 100,
    }),
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanApplication.prototype, "riskScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Risk assessment details",
        example: { factors: ["income_stable", "low_dti"], rating: "A" },
    }),
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanApplication.prototype, "riskAssessment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Decision reason",
        example: "Insufficient income",
    }),
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanApplication.prototype, "decisionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Decisioned by user ID",
        example: "123e4567-e89b-12d3-a456-426614174003",
    }),
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], LoanApplication.prototype, "decisionedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Decision date",
    }),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LoanApplication.prototype, "decisionedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Application submission date",
    }),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LoanApplication.prototype, "submittedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Application expiry date",
    }),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LoanApplication.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Additional metadata",
        example: { source: "web", campaign: "summer2024" },
    }),
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanApplication.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Internal notes",
        example: "Customer has existing relationship",
    }),
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanApplication.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Loan application creation timestamp",
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], LoanApplication.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Last update timestamp",
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], LoanApplication.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: "timestamp", nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], LoanApplication.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Version for optimistic locking",
        example: 1,
        default: 1,
    }),
    (0, typeorm_1.Column)({ type: "integer", default: 1, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanApplication.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.loanApplications, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.User)
], LoanApplication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => loan_entity_1.Loan, (loan) => loan.loanApplication, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], LoanApplication.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => loan_document_entity_1.LoanDocument, (document) => document.loanApplication),
    __metadata("design:type", Array)
], LoanApplication.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => loan_collateral_entity_1.LoanCollateral, (collateral) => collateral.loanApplication),
    __metadata("design:type", Array)
], LoanApplication.prototype, "collaterals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => loan_guarantor_entity_1.LoanGuarantor, (guarantor) => guarantor.loanApplication),
    __metadata("design:type", Array)
], LoanApplication.prototype, "guarantors", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoanApplication.prototype, "generateApplicationNumber", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoanApplication.prototype, "updateVersion", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanApplication.prototype, "isExpired", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanApplication.prototype, "isComplete", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanApplication.prototype, "daysSinceSubmission", null);
exports.LoanApplication = LoanApplication = __decorate([
    (0, typeorm_1.Entity)("loan_applications"),
    (0, typeorm_1.Index)(["applicationNumber"], { unique: true }),
    (0, typeorm_1.Index)(["userId"]),
    (0, typeorm_1.Index)(["status"]),
    (0, typeorm_1.Index)(["submittedAt"])
], LoanApplication);
//# sourceMappingURL=loan-application.entity.js.map