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
exports.AdminActionDto = exports.AdminActionType = void 0;
const class_validator_1 = require("class-validator");
var AdminActionType;
(function (AdminActionType) {
    AdminActionType["CREATE"] = "create";
    AdminActionType["UPDATE"] = "update";
    AdminActionType["DELETE"] = "delete";
    AdminActionType["VIEW"] = "view";
    AdminActionType["EXPORT"] = "export";
    AdminActionType["IMPORT"] = "import";
    AdminActionType["LOGIN"] = "login";
    AdminActionType["LOGOUT"] = "logout";
    AdminActionType["CONFIG_CHANGE"] = "config_change";
    AdminActionType["PERMISSION_CHANGE"] = "permission_change";
    AdminActionType["USER_MANAGEMENT"] = "user_management";
    AdminActionType["SYSTEM_MAINTENANCE"] = "system_maintenance";
})(AdminActionType || (exports.AdminActionType = AdminActionType = {}));
class AdminActionDto {
}
exports.AdminActionDto = AdminActionDto;
__decorate([
    (0, class_validator_1.IsEnum)(AdminActionType),
    __metadata("design:type", String)
], AdminActionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AdminActionDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "resourceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "resourceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIP)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "userAgent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AdminActionDto.prototype, "metadata", void 0);
//# sourceMappingURL=admin-action.dto.js.map