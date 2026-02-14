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
exports.GenerateApiKeyDto = exports.ApiKeyPermission = void 0;
const class_validator_1 = require("class-validator");
var ApiKeyPermission;
(function (ApiKeyPermission) {
    ApiKeyPermission["READ"] = "read";
    ApiKeyPermission["WRITE"] = "write";
    ApiKeyPermission["DELETE"] = "delete";
    ApiKeyPermission["ADMIN"] = "admin";
    ApiKeyPermission["REPORTS"] = "reports";
    ApiKeyPermission["PAYMENTS"] = "payments";
    ApiKeyPermission["USERS"] = "users";
    ApiKeyPermission["LOANS"] = "loans";
})(ApiKeyPermission || (exports.ApiKeyPermission = ApiKeyPermission = {}));
class GenerateApiKeyDto {
}
exports.GenerateApiKeyDto = GenerateApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], GenerateApiKeyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(ApiKeyPermission, { each: true, message: 'Invalid permission' }),
    __metadata("design:type", Array)
], GenerateApiKeyDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateApiKeyDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateApiKeyDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateApiKeyDto.prototype, "allowedIps", void 0);
//# sourceMappingURL=generate-api-key.dto.js.map