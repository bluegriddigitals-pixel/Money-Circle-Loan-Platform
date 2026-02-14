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
exports.LoanApplicationResponseDto = exports.LoanApplicationFilterDto = exports.UpdateLoanApplicationDto = exports.CreateLoanApplicationDto = exports.GuarantorDto = exports.CollateralDto = exports.LoanDocumentDto = exports.UserBasicInfoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const loan_entity_1 = require("../entities/loan.entity");
class UserBasicInfoDto {
}
exports.UserBasicInfoDto = UserBasicInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "phoneNumber", void 0);
class LoanDocumentDto {
}
exports.LoanDocumentDto = LoanDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanDocumentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Document name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanDocumentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Document metadata' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], LoanDocumentDto.prototype, "metadata", void 0);
class CollateralDto {
}
exports.CollateralDto = CollateralDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollateralDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral value' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CollateralDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CollateralDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CollateralDto.prototype, "documents", void 0);
class GuarantorDto {
}
exports.GuarantorDto = GuarantorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor full name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor email' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor phone number' }),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantor relationship to borrower' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantor employment status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantor annual income' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GuarantorDto.prototype, "annualIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantor identification number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "idNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantor documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GuarantorDto.prototype, "documents", void 0);
class CreateLoanApplicationDto {
}
exports.CreateLoanApplicationDto = CreateLoanApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.LoanType, description: 'Loan type' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.LoanType),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan amount', minimum: 100, maximum: 10000000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(10000000),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan tenure in months', minimum: 1, maximum: 360 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "tenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest rate', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.RepaymentFrequency, description: 'Repayment frequency' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.RepaymentFrequency),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan purpose' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "applicationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required by date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "requiredByDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLoanApplicationDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CollateralDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CollateralDto)
], CreateLoanApplicationDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantors' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GuarantorDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLoanApplicationDto.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has collateral' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLoanApplicationDto.prototype, "hasCollateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has guarantors' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLoanApplicationDto.prototype, "hasGuarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Existing loan ID if refinancing' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "existingLoanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for loan officer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employment status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employer name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "employerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monthly income' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Years employed' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "yearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Credit score' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application source' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign source' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "campaign", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Referral code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLoanApplicationDto.prototype, "metadata", void 0);
class UpdateLoanApplicationDto {
}
exports.UpdateLoanApplicationDto = UpdateLoanApplicationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_entity_1.LoanType, description: 'Loan type' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.LoanType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan amount', minimum: 100, maximum: 10000000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(10000000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan tenure in months', minimum: 1, maximum: 360 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "tenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interest rate', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_entity_1.RepaymentFrequency, description: 'Repayment frequency' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.RepaymentFrequency),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_entity_1.LoanStatus, description: 'Application status' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.LoanStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan purpose' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required by date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "requiredByDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLoanApplicationDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CollateralDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CollateralDto)
], UpdateLoanApplicationDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guarantors' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GuarantorDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLoanApplicationDto.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has collateral' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLoanApplicationDto.prototype, "hasCollateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has guarantors' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLoanApplicationDto.prototype, "hasGuarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for loan officer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employment status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employer name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "employerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monthly income' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Years employed' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "yearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Credit score' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanApplicationDto.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateLoanApplicationDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reviewer notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "reviewerNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rejection reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanApplicationDto.prototype, "rejectionReason", void 0);
class LoanApplicationFilterDto {
}
exports.LoanApplicationFilterDto = LoanApplicationFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_entity_1.LoanStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.LoanStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_entity_1.LoanType, description: 'Filter by loan type' }),
    (0, class_validator_1.IsEnum)(loan_entity_1.LoanType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by user ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoanApplicationFilterDto.prototype, "minAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoanApplicationFilterDto.prototype, "maxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for application date range' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for application date range' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for purpose or description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoanApplicationFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoanApplicationFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by field' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ASC', 'DESC'], description: 'Sort order' }),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoanApplicationFilterDto.prototype, "sortOrder", void 0);
class LoanApplicationResponseDto {
    get isComplete() {
        return !!this.documents?.length &&
            (!this.hasCollateral || !!this.collateral) &&
            (!this.hasGuarantors || this.guarantors?.length > 0);
    }
}
exports.LoanApplicationResponseDto = LoanApplicationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "applicationNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.LoanType }),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "tenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.RepaymentFrequency }),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.LoanStatus }),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanApplicationResponseDto.prototype, "applicationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanApplicationResponseDto.prototype, "requiredByDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "borrowerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserBasicInfoDto }),
    (0, class_transformer_1.Type)(() => UserBasicInfoDto),
    __metadata("design:type", UserBasicInfoDto)
], LoanApplicationResponseDto.prototype, "borrower", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [LoanDocumentDto] }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    __metadata("design:type", Array)
], LoanApplicationResponseDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CollateralDto }),
    (0, class_transformer_1.Type)(() => CollateralDto),
    __metadata("design:type", CollateralDto)
], LoanApplicationResponseDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [GuarantorDto] }),
    (0, class_transformer_1.Type)(() => GuarantorDto),
    __metadata("design:type", Array)
], LoanApplicationResponseDto.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], LoanApplicationResponseDto.prototype, "hasCollateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], LoanApplicationResponseDto.prototype, "hasGuarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "existingLoanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "employerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "yearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanApplicationResponseDto.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "campaign", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], LoanApplicationResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "reviewerNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "reviewedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanApplicationResponseDto.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanApplicationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanApplicationResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanApplicationResponseDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanApplicationResponseDto.prototype, "isComplete", null);
//# sourceMappingURL=loan-application.dto.js.map