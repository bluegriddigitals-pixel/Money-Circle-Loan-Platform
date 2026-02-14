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
exports.CreateEscrowAccountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const escrow_enum_1 = require("../enums/escrow.enum");
class CreateEscrowAccountDto {
    constructor() {
        this.type = escrow_enum_1.EscrowAccountType.LOAN;
        this.initialAmount = 0;
    }
}
exports.CreateEscrowAccountDto = CreateEscrowAccountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the associated loan',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow account name',
        example: 'Loan Disbursement Escrow - Loan #L2024-001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow account type',
        enum: escrow_enum_1.EscrowAccountType,
        example: escrow_enum_1.EscrowAccountType.LOAN,
        default: escrow_enum_1.EscrowAccountType.LOAN,
    }),
    (0, class_validator_1.IsEnum)(escrow_enum_1.EscrowAccountType),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Initial deposit amount',
        example: 50000.0,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEscrowAccountDto.prototype, "initialAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum required balance',
        example: 1000.0,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEscrowAccountDto.prototype, "minimumBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum allowed balance',
        example: 100000.0,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEscrowAccountDto.prototype, "maximumBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow holder name',
        example: 'John Smith',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "holderName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Escrow holder email',
        example: 'john.smith@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "holderEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Escrow holder phone',
        example: '+1234567890',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "holderPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Beneficiary name',
        example: 'Jane Doe',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "beneficiaryName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Beneficiary email',
        example: 'jane.doe@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "beneficiaryEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bank account details for withdrawals',
        example: {
            bankName: 'First National Bank',
            accountNumber: '1234567890',
            routingNumber: '021000021',
            accountType: 'checking',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEscrowAccountDto.prototype, "bankAccount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release conditions',
        example: ['loan_approval', 'contract_signing', 'property_inspection'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEscrowAccountDto.prototype, "releaseConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Interest rate for funds held',
        example: 2.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateEscrowAccountDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maturity/Release date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateEscrowAccountDto.prototype, "maturityDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes/comments',
        example: 'Escrow for initial loan disbursement',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowAccountDto.prototype, "notes", void 0);
//# sourceMappingURL=create-escrow-account.dto.js.map