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
exports.CreateDisbursementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const disbursement_enum_1 = require("../enums/disbursement.enum");
class CreateDisbursementDto {
}
exports.CreateDisbursementDto = CreateDisbursementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the associated loan',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the escrow account used for disbursement',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "escrowAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Disbursement type',
        enum: disbursement_enum_1.DisbursementType,
        example: disbursement_enum_1.DisbursementType.LOAN_DISBURSEMENT,
    }),
    (0, class_validator_1.IsEnum)(disbursement_enum_1.DisbursementType),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total disbursement amount',
        example: 50000.0,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDisbursementDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Disbursement method',
        enum: disbursement_enum_1.DisbursementMethod,
        example: disbursement_enum_1.DisbursementMethod.BANK_TRANSFER,
    }),
    (0, class_validator_1.IsEnum)(disbursement_enum_1.DisbursementMethod),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient name',
        example: 'John Borrower',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient email',
        example: 'john.borrower@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient phone',
        example: '+1234567890',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment details (bank account, wallet, etc.)',
        example: {
            bankName: 'First National Bank',
            accountNumber: '1234567890',
            routingNumber: '021000021',
            accountHolder: 'John Borrower',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDisbursementDto.prototype, "paymentDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Disbursement instructions',
        example: 'Disburse in two equal installments',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisbursementDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Scheduled disbursement date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateDisbursementDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Disbursement schedule (for multiple installments)',
        example: [
            { amount: 25000, dueDate: '2024-02-01' },
            { amount: 25000, dueDate: '2024-03-01' },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateDisbursementDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Supporting documents',
        example: [
            { type: 'loan_agreement', url: 'https://example.com/agreement.pdf', name: 'Loan Agreement' },
            { type: 'id_verification', url: 'https://example.com/id.pdf', name: 'ID Verification' },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDisbursementDto.prototype, "supportingDocuments", void 0);
//# sourceMappingURL=create-disbursement.dto.js.map