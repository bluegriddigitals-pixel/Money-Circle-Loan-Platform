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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_user_entity_1 = require("./entities/admin-user.entity");
const admin_action_entity_1 = require("./entities/admin-action.entity");
const system_config_entity_1 = require("./entities/system-config.entity");
const system_maintenance_entity_1 = require("./entities/system-maintenance.entity");
const api_key_entity_1 = require("./entities/api-key.entity");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
let AdminService = AdminService_1 = class AdminService {
    constructor(adminUserRepository, adminActionRepository, systemConfigRepository, systemMaintenanceRepository, apiKeyRepository) {
        this.adminUserRepository = adminUserRepository;
        this.adminActionRepository = adminActionRepository;
        this.systemConfigRepository = systemConfigRepository;
        this.systemMaintenanceRepository = systemMaintenanceRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async createAdminUser(createAdminUserDto) {
        const { password, ...userData } = createAdminUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminUser = this.adminUserRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            isActive: true,
        });
        return this.adminUserRepository.save(adminUser);
    }
    async findAllAdminUsers() {
        return this.adminUserRepository.find({
            relations: ['createdBy'],
        });
    }
    async findAdminUserById(id) {
        const user = await this.adminUserRepository.findOne({
            where: { id },
            relations: ['createdBy', 'adminActions'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Admin user with ID ${id} not found`);
        }
        return user;
    }
    async updateAdminUser(id, updateAdminUserDto) {
        const adminUser = await this.findAdminUserById(id);
        if (updateAdminUserDto.password) {
            const passwordHash = await bcrypt.hash(updateAdminUserDto.password, 10);
            delete updateAdminUserDto.password;
            Object.assign(adminUser, updateAdminUserDto, { passwordHash });
        }
        else {
            Object.assign(adminUser, updateAdminUserDto);
        }
        return this.adminUserRepository.save(adminUser);
    }
    async deactivateAdminUser(id) {
        const adminUser = await this.findAdminUserById(id);
        adminUser.isActive = false;
        await this.adminUserRepository.save(adminUser);
    }
    async findByEmail(email) {
        return this.adminUserRepository.findOne({ where: { email } });
    }
    async validateAdminUser(email, password) {
        const user = await this.findByEmail(email);
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            return user;
        }
        return null;
    }
    async logAdminAction(adminUserId, action, details, ipAddress, userAgent) {
        const adminAction = this.adminActionRepository.create({
            adminUser: { id: adminUserId },
            action,
            details,
            ipAddress,
            userAgent,
        });
        return this.adminActionRepository.save(adminAction);
    }
    async getAdminActions(adminUserId, startDate, endDate, action) {
        const where = {};
        if (adminUserId) {
            where.adminUser = { id: adminUserId };
        }
        if (startDate && endDate) {
            where.createdAt = (0, typeorm_2.Between)(startDate, endDate);
        }
        if (action) {
            where.action = (0, typeorm_2.Like)(`%${action}%`);
        }
        return this.adminActionRepository.find({
            where,
            relations: ['adminUser'],
            order: { createdAt: 'DESC' },
        });
    }
    async getSystemConfig(key, defaultValue) {
        const config = await this.systemConfigRepository.findOne({ where: { key } });
        if (!config) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new common_1.NotFoundException(`Configuration key ${key} not found`);
        }
        return config.value;
    }
    async setSystemConfig(createSystemConfigDto) {
        const existingConfig = await this.systemConfigRepository.findOne({
            where: { key: createSystemConfigDto.key },
        });
        if (existingConfig) {
            existingConfig.value = createSystemConfigDto.value;
            existingConfig.description = createSystemConfigDto.description;
            existingConfig.dataType = createSystemConfigDto.dataType;
            return this.systemConfigRepository.save(existingConfig);
        }
        const config = this.systemConfigRepository.create(createSystemConfigDto);
        return this.systemConfigRepository.save(config);
    }
    async getAllSystemConfigs() {
        return this.systemConfigRepository.find({
            order: { key: 'ASC' },
        });
    }
    async updateSystemConfig(id, updateSystemConfigDto) {
        const config = await this.systemConfigRepository.findOne({ where: { id } });
        if (!config) {
            throw new common_1.NotFoundException(`System config with ID ${id} not found`);
        }
        Object.assign(config, updateSystemConfigDto);
        return this.systemConfigRepository.save(config);
    }
    async deleteSystemConfig(id) {
        const result = await this.systemConfigRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`System config with ID ${id} not found`);
        }
    }
    async createMaintenanceWindow(startTime, endTime, description, createdBy) {
        const maintenance = this.systemMaintenanceRepository.create({
            startTime,
            endTime,
            description,
            createdBy: { id: createdBy },
            isActive: true,
        });
        return this.systemMaintenanceRepository.save(maintenance);
    }
    async getCurrentMaintenance() {
        const now = new Date();
        return this.systemMaintenanceRepository.findOne({
            where: {
                startTime: (0, typeorm_2.LessThanOrEqual)(now),
                endTime: (0, typeorm_2.MoreThanOrEqual)(now),
                isActive: true,
            },
        });
    }
    async completeMaintenance(id) {
        const maintenance = await this.systemMaintenanceRepository.findOne({ where: { id } });
        if (!maintenance) {
            throw new common_1.NotFoundException(`Maintenance window with ID ${id} not found`);
        }
        maintenance.isActive = false;
        await this.systemMaintenanceRepository.save(maintenance);
    }
    async generateApiKey(name, permissions, expiresAt) {
        const apiKey = this.apiKeyRepository.create({
            name,
            key: `mc_${(0, uuid_1.v4)()}`,
            permissions,
            expiresAt,
            isActive: true,
        });
        return this.apiKeyRepository.save(apiKey);
    }
    async validateApiKey(key) {
        const apiKey = await this.apiKeyRepository.findOne({
            where: { key, isActive: true },
        });
        if (!apiKey) {
            return false;
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return false;
        }
        apiKey.lastUsedAt = new Date();
        await this.apiKeyRepository.save(apiKey);
        return true;
    }
    async revokeApiKey(id) {
        const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
        if (!apiKey) {
            throw new common_1.NotFoundException(`API key with ID ${id} not found`);
        }
        apiKey.isActive = false;
        await this.apiKeyRepository.save(apiKey);
    }
    async getDashboardStats() {
        const totalAdmins = await this.adminUserRepository.count();
        const activeAdmins = await this.adminUserRepository.count({ where: { isActive: true } });
        const recentActions = await this.adminActionRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 999))),
            },
        });
        const totalApiKeys = await this.apiKeyRepository.count({ where: { isActive: true } });
        return {
            totalAdmins,
            activeAdmins,
            recentActions,
            totalApiKeys,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_user_entity_1.AdminUser)),
    __param(1, (0, typeorm_1.InjectRepository)(admin_action_entity_1.AdminAction)),
    __param(2, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __param(3, (0, typeorm_1.InjectRepository)(system_maintenance_entity_1.SystemMaintenance)),
    __param(4, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map