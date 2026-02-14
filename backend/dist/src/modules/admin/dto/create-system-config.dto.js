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
exports.CreateSystemConfigDto = exports.ConfigDataType = void 0;
const class_validator_1 = require("class-validator");
var ConfigDataType;
(function (ConfigDataType) {
    ConfigDataType["STRING"] = "string";
    ConfigDataType["NUMBER"] = "number";
    ConfigDataType["BOOLEAN"] = "boolean";
    ConfigDataType["JSON"] = "json";
})(ConfigDataType || (exports.ConfigDataType = ConfigDataType = {}));
class CreateSystemConfigDto {
}
exports.CreateSystemConfigDto = CreateSystemConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSystemConfigDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateIf)(o => o.dataType === ConfigDataType.STRING, { message: 'Value must be a string' }),
    (0, class_validator_1.ValidateIf)(o => o.dataType === ConfigDataType.NUMBER, { message: 'Value must be a number' }),
    (0, class_validator_1.ValidateIf)(o => o.dataType === ConfigDataType.BOOLEAN, { message: 'Value must be a boolean' }),
    (0, class_validator_1.ValidateIf)(o => o.dataType === ConfigDataType.JSON, { message: 'Value must be a valid JSON object' }),
    __metadata("design:type", Object)
], CreateSystemConfigDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemConfigDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ConfigDataType),
    __metadata("design:type", String)
], CreateSystemConfigDto.prototype, "dataType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemConfigDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemConfigDto.prototype, "isPublic", void 0);
//# sourceMappingURL=create-system-config.dto.js.map