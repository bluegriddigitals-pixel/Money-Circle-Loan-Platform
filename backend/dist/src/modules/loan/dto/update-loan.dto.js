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
exports.UpdateLoanDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const loan_status_enum_1 = require("../enums/loan-status.enum");
const create_loan_dto_1 = require("./create-loan.dto");
class UpdateLoanDto {
}
exports.UpdateLoanDto = UpdateLoanDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_status_enum_1.LoanType, description: 'Loan type' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.LoanType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan amount', minimum: 100, maximum: 10000000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(10000000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interest rate', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_status_enum_1.InterestType, description: 'Interest type' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.InterestType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "interestType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan term in months', minimum: 1, maximum: 360 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_status_enum_1.RepaymentFrequency, description: 'Repayment frequency' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.RepaymentFrequency),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_status_enum_1.LoanPurpose, description: 'Loan purpose' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.LoanPurpose),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: loan_status_enum_1.LoanStatus, description: 'Loan status' }),
    (0, class_validator_1.IsEnum)(loan_status_enum_1.LoanStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required by date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "requiredByDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approval date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "approvalDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Disbursement date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "disbursementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'First payment date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "firstPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maturity date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "maturityDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan documents' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_loan_dto_1.LoanDocumentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLoanDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Collateral information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_loan_dto_1.CollateralDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", create_loan_dto_1.CollateralDto)
], UpdateLoanDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has collateral' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLoanDto.prototype, "hasCollateral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rejection reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for loan officer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approved by user ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "approvedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Underwriter user ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "underwriterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan officer user ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "loanOfficerId", void 0);
//# sourceMappingURL=update-loan.dto.js.map