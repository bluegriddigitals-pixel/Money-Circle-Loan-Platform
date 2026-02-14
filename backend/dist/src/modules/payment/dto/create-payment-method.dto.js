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
exports.CreatePaymentMethodDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const payment_method_enum_1 = require("../enums/payment-method.enum");
class CreatePaymentMethodDto {
    constructor() {
        this.isDefault = false;
    }
}
exports.CreatePaymentMethodDto = CreatePaymentMethodDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who owns this payment method',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method type',
        enum: payment_method_enum_1.PaymentMethodType,
        example: payment_method_enum_1.PaymentMethodType.CREDIT_CARD,
    }),
    (0, class_validator_1.IsEnum)(payment_method_enum_1.PaymentMethodType),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last four digits of the card/account',
        example: '1234',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(4),
    (0, class_validator_1.MaxLength)(4),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "lastFour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Card/Account holder name',
        example: 'John Smith',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "holderName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Card expiry month (1-12)',
        example: 12,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreatePaymentMethodDto.prototype, "expiryMonth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Card expiry year',
        example: 2026,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2024),
    __metadata("design:type", Number)
], CreatePaymentMethodDto.prototype, "expiryYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bank name',
        example: 'First National Bank',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment gateway token/reference',
        example: 'tok_visa_123456789',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "gatewayToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment gateway customer ID',
        example: 'cus_123456789',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePaymentMethodDto.prototype, "gatewayCustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Billing address',
        example: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePaymentMethodDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is this the default payment method',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePaymentMethodDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { verified: true, verificationDate: '2024-01-15' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePaymentMethodDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-payment-method.dto.js.map