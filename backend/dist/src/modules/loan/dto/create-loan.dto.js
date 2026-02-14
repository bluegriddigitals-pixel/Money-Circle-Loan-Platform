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
exports.CreateLoanDto = exports.CollateralDto = exports.LoanDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const loan_status_enum_1 = require("../enums/loan-status.enum");
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
class CreateLoanDto {
}
exports.CreateLoanDto = CreateLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_status_enum_1.LoanType, description: 'Loan type' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.LoanType),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan amount', minimum: 100, maximum: 10000000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(10000000),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest rate', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_status_enum_1.InterestType, description: 'Interest type' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.InterestType),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "interestType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan term in months', minimum: 1, maximum: 360 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_status_enum_1.RepaymentFrequency, description: 'Repayment frequency' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.RepaymentFrequency),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: loan_status_enum_1.LoanPurpose, description: 'Loan purpose' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.LoanPurpose),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "applicationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required by date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "requiredByDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLoanDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CollateralDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CollateralDto)
], CreateLoanDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has collateral' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLoanDto.prototype, "hasCollateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Existing loan ID if refinancing' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "existingLoanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for loan officer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "notes", void 0);
//# sourceMappingURL=create-loan.dto.js.map