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
exports.VerifyTwoFactorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyTwoFactorDto {
}
exports.VerifyTwoFactorDto = VerifyTwoFactorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], VerifyTwoFactorDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '2FA verification code',
        example: '123456',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTwoFactorDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '2FA method (authenticator, sms, email, backup)',
        example: 'authenticator',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTwoFactorDto.prototype, "method", void 0);
//# sourceMappingURL=verify-two-factor.dto.js.map