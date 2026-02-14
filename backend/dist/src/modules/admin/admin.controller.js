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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
const create_admin_user_dto_1 = require("./dto/create-admin-user.dto");
const update_admin_user_dto_1 = require("./dto/update-admin-user.dto");
const create_system_config_dto_1 = require("./dto/create-system-config.dto");
const update_system_config_dto_1 = require("./dto/update-system-config.dto");
const generate_api_key_dto_1 = require("./dto/generate-api-key.dto");
const admin_action_dto_1 = require("./dto/admin-action.dto");
let AdminController = AdminController_1 = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
        this.logger = new common_1.Logger(AdminController_1.name);
    }
    async createAdminUser(createAdminUserDto, req) {
        const user = await this.adminService.createAdminUser(createAdminUserDto);
        await this.adminService.logAdminAction(req.user.id, 'CREATE_ADMIN_USER', { userId: user.id, email: user.email }, req.ip, req.headers['user-agent']);
        return user;
    }
    async getAllAdminUsers() {
        return this.adminService.findAllAdminUsers();
    }
    async getAdminUser(id) {
        return this.adminService.findAdminUserById(id);
    }
    async updateAdminUser(id, updateAdminUserDto, req) {
        const user = await this.adminService.updateAdminUser(id, updateAdminUserDto);
        await this.adminService.logAdminAction(req.user.id, 'UPDATE_ADMIN_USER', { userId: id }, req.ip, req.headers['user-agent']);
        return user;
    }
    async deactivateAdminUser(id, req) {
        await this.adminService.deactivateAdminUser(id);
        await this.adminService.logAdminAction(req.user.id, 'DEACTIVATE_ADMIN_USER', { userId: id }, req.ip, req.headers['user-agent']);
    }
    async getAdminActions(adminUserId, startDate, endDate, action) {
        return this.adminService.getAdminActions(adminUserId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, action);
    }
    async logAdminAction(adminActionDto, req) {
        return this.adminService.logAdminAction(req.user.id, adminActionDto.action, adminActionDto.details, req.ip, req.headers['user-agent']);
    }
    async getAllConfigs() {
        return this.adminService.getAllSystemConfigs();
    }
    async getConfig(key, defaultValue) {
        return this.adminService.getSystemConfig(key, defaultValue);
    }
    async setConfig(createSystemConfigDto, req) {
        const config = await this.adminService.setSystemConfig(createSystemConfigDto);
        await this.adminService.logAdminAction(req.user.id, 'SET_SYSTEM_CONFIG', { key: createSystemConfigDto.key }, req.ip, req.headers['user-agent']);
        return config;
    }
    async updateConfig(id, updateSystemConfigDto, req) {
        const config = await this.adminService.updateSystemConfig(id, updateSystemConfigDto);
        await this.adminService.logAdminAction(req.user.id, 'UPDATE_SYSTEM_CONFIG', { configId: id }, req.ip, req.headers['user-agent']);
        return config;
    }
    async deleteConfig(id, req) {
        await this.adminService.deleteSystemConfig(id);
        await this.adminService.logAdminAction(req.user.id, 'DELETE_SYSTEM_CONFIG', { configId: id }, req.ip, req.headers['user-agent']);
    }
    async createMaintenanceWindow(body, req) {
        const maintenance = await this.adminService.createMaintenanceWindow(body.startTime, body.endTime, body.description, req.user.id);
        await this.adminService.logAdminAction(req.user.id, 'CREATE_MAINTENANCE', { maintenanceId: maintenance.id }, req.ip, req.headers['user-agent']);
        return maintenance;
    }
    async getCurrentMaintenance() {
        return this.adminService.getCurrentMaintenance();
    }
    async completeMaintenance(id, req) {
        await this.adminService.completeMaintenance(id);
        await this.adminService.logAdminAction(req.user.id, 'COMPLETE_MAINTENANCE', { maintenanceId: id }, req.ip, req.headers['user-agent']);
    }
    async generateApiKey(generateApiKeyDto, req) {
        const expiresAt = generateApiKeyDto.expiresAt
            ? new Date(generateApiKeyDto.expiresAt)
            : undefined;
        const apiKey = await this.adminService.generateApiKey(generateApiKeyDto.name, generateApiKeyDto.permissions, expiresAt);
        await this.adminService.logAdminAction(req.user.id, 'GENERATE_API_KEY', { keyId: apiKey.id, name: apiKey.name }, req.ip, req.headers['user-agent']);
        return apiKey;
    }
    async validateApiKey(body) {
        const isValid = await this.adminService.validateApiKey(body.key);
        return { valid: isValid };
    }
    async revokeApiKey(id, req) {
        await this.adminService.revokeApiKey(id);
        await this.adminService.logAdminAction(req.user.id, 'REVOKE_API_KEY', { keyId: id }, req.ip, req.headers['user-agent']);
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'admin-module',
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_user_dto_1.CreateAdminUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdminUser", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllAdminUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_user_dto_1.UpdateAdminUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdminUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateAdminUser", null);
__decorate([
    (0, common_1.Get)('actions'),
    __param(0, (0, common_1.Query)('adminUserId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminActions", null);
__decorate([
    (0, common_1.Post)('actions/log'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_action_dto_1.AdminActionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "logAdminAction", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Get)('config/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('default')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_system_config_dto_1.CreateSystemConfigDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setConfig", null);
__decorate([
    (0, common_1.Put)('config/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_system_config_dto_1.UpdateSystemConfigDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Delete)('config/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createMaintenanceWindow", null);
__decorate([
    (0, common_1.Get)('maintenance/current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCurrentMaintenance", null);
__decorate([
    (0, common_1.Put)('maintenance/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "completeMaintenance", null);
__decorate([
    (0, common_1.Post)('api-keys'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_api_key_dto_1.GenerateApiKeyDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateApiKey", null);
__decorate([
    (0, common_1.Post)('api-keys/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Delete)('api-keys/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "healthCheck", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SYSTEM_ADMIN),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map