import { AdminService } from './admin.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { GenerateApiKeyDto } from './dto/generate-api-key.dto';
import { AdminActionDto } from './dto/admin-action.dto';
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    createAdminUser(createAdminUserDto: CreateAdminUserDto, req: any): Promise<import("./entities/admin-user.entity").AdminUser>;
    getAllAdminUsers(): Promise<import("./entities/admin-user.entity").AdminUser[]>;
    getAdminUser(id: string): Promise<import("./entities/admin-user.entity").AdminUser>;
    updateAdminUser(id: string, updateAdminUserDto: UpdateAdminUserDto, req: any): Promise<import("./entities/admin-user.entity").AdminUser>;
    deactivateAdminUser(id: string, req: any): Promise<void>;
    getAdminActions(adminUserId?: string, startDate?: string, endDate?: string, action?: string): Promise<import("./entities/admin-action.entity").AdminAction[]>;
    logAdminAction(adminActionDto: AdminActionDto, req: any): Promise<import("./entities/admin-action.entity").AdminAction>;
    getAllConfigs(): Promise<import("./entities/system-config.entity").SystemConfig[]>;
    getConfig(key: string, defaultValue?: string): Promise<any>;
    setConfig(createSystemConfigDto: CreateSystemConfigDto, req: any): Promise<import("./entities/system-config.entity").SystemConfig>;
    updateConfig(id: string, updateSystemConfigDto: UpdateSystemConfigDto, req: any): Promise<import("./entities/system-config.entity").SystemConfig>;
    deleteConfig(id: string, req: any): Promise<void>;
    createMaintenanceWindow(body: {
        startTime: Date;
        endTime: Date;
        description: string;
    }, req: any): Promise<import("./entities/system-maintenance.entity").SystemMaintenance>;
    getCurrentMaintenance(): Promise<import("./entities/system-maintenance.entity").SystemMaintenance>;
    completeMaintenance(id: string, req: any): Promise<void>;
    generateApiKey(generateApiKeyDto: GenerateApiKeyDto, req: any): Promise<import("./entities/api-key.entity").ApiKey>;
    validateApiKey(body: {
        key: string;
    }): Promise<{
        valid: boolean;
    }>;
    revokeApiKey(id: string, req: any): Promise<void>;
    getDashboardStats(): Promise<any>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        service: string;
    }>;
}
