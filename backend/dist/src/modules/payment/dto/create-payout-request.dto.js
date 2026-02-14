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
exports.CreatePayoutRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const payout_enum_1 = require("../enums/payout.enum");
class CreatePayoutRequestDto {
}
exports.CreatePayoutRequestDto = CreatePayoutRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user requesting the payout',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the escrow account (if applicable)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "escrowAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payout request type',
        enum: payout_enum_1.PayoutRequestType,
        example: payout_enum_1.PayoutRequestType.LOAN_DISBURSEMENT,
    }),
    (0, class_validator_1.IsEnum)(payout_enum_1.PayoutRequestType),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payout amount',
        example: 5000.0,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayoutRequestDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payout method',
        enum: payout_enum_1.PayoutMethod,
        example: payout_enum_1.PayoutMethod.BANK_TRANSFER,
    }),
    (0, class_validator_1.IsEnum)(payout_enum_1.PayoutMethod),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "payoutMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient name',
        example: 'Jane Doe',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient email',
        example: 'jane.doe@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient phone',
        example: '+1234567890',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment details (bank account, wallet, etc.)',
        example: {
            bankName: 'First National Bank',
            accountNumber: '1234567890',
            routingNumber: '021000021',
            accountHolder: 'Jane Doe',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePayoutRequestDto.prototype, "paymentDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payout purpose/description',
        example: 'Loan disbursement for home renovation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal reference/notes',
        example: 'Loan ID: L2024-001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "internalReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { source: 'web', ipAddress: '192.168.1.1' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePayoutRequestDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Supporting documents',
        example: [
            { type: 'invoice', url: 'https://example.com/invoice.pdf', name: 'Invoice' },
            { type: 'agreement', url: 'https://example.com/agreement.pdf', name: 'Agreement' },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePayoutRequestDto.prototype, "supportingDocuments", void 0);
//# sourceMappingURL=create-payout-request.dto.js.map