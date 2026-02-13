import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import { AdminAction } from './entities/admin-action.entity';
import { SystemConfig } from './entities/system-config.entity';
import { SystemMaintenance } from './entities/system-maintenance.entity';
import { ApiKey } from './entities/api-key.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    
    @InjectRepository(AdminAction)
    private adminActionRepository: Repository<AdminAction>,
    
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
    
    @InjectRepository(SystemMaintenance)
    private systemMaintenanceRepository: Repository<SystemMaintenance>,
    
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async createAdminUser(createAdminUserDto: CreateAdminUserDto): Promise<AdminUser> {
    const { password, ...userData } = createAdminUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminUser = this.adminUserRepository.create({
      ...userData,
      passwordHash: hashedPassword,
      isActive: true,
    });
    
    return this.adminUserRepository.save(adminUser);
  }

  async findAllAdminUsers(): Promise<AdminUser[]> {
    return this.adminUserRepository.find({
      relations: ['createdBy'],
    });
  }

  async findAdminUserById(id: string): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({
      where: { id },
      relations: ['createdBy', 'adminActions'],
    });
    
    if (!user) {
      throw new NotFoundException(`Admin user with ID ${id} not found`);
    }
    
    return user;
  }

  async updateAdminUser(id: string, updateAdminUserDto: UpdateAdminUserDto): Promise<AdminUser> {
    const adminUser = await this.findAdminUserById(id);
    
    if (updateAdminUserDto.password) {
      updateAdminUserDto['passwordHash'] = await bcrypt.hash(updateAdminUserDto.password, 10);
      delete updateAdminUserDto.password;
    }
    
    Object.assign(adminUser, updateAdminUserDto);
    return this.adminUserRepository.save(adminUser);
  }

  async deactivateAdminUser(id: string): Promise<void> {
    const adminUser = await this.findAdminUserById(id);
    adminUser.isActive = false;
    await this.adminUserRepository.save(adminUser);
  }

  async findByEmail(email: string): Promise<AdminUser | undefined> {
    return this.adminUserRepository.findOne({ where: { email } });
  }

  async validateAdminUser(email: string, password: string): Promise<AdminUser | null> {
    const user = await this.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    
    return null;
  }

  async logAdminAction(
    adminUserId: string,
    action: string,
    details: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AdminAction> {
    const adminAction = this.adminActionRepository.create({
      adminUser: { id: adminUserId },
      action,
      details,
      ipAddress,
      userAgent,
    });
    
    return this.adminActionRepository.save(adminAction);
  }

  async getAdminActions(
    adminUserId?: string,
    startDate?: Date,
    endDate?: Date,
    action?: string,
  ): Promise<AdminAction[]> {
    const where: any = {};
    
    if (adminUserId) {
      where.adminUser = { id: adminUserId };
    }
    
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }
    
    if (action) {
      where.action = Like(`%${action}%`);
    }
    
    return this.adminActionRepository.find({
      where,
      relations: ['adminUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSystemConfig(key: string, defaultValue?: any): Promise<any> {
    const config = await this.systemConfigRepository.findOne({ where: { key } });
    
    if (!config) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new NotFoundException(`Configuration key ${key} not found`);
    }
    
    return config.value;
  }

  async setSystemConfig(createSystemConfigDto: CreateSystemConfigDto): Promise<SystemConfig> {
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

  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    return this.systemConfigRepository.find({
      order: { key: 'ASC' },
    });
  }

  async updateSystemConfig(id: string, updateSystemConfigDto: UpdateSystemConfigDto): Promise<SystemConfig> {
    const config = await this.systemConfigRepository.findOne({ where: { id } });
    
    if (!config) {
      throw new NotFoundException(`System config with ID ${id} not found`);
    }
    
    Object.assign(config, updateSystemConfigDto);
    return this.systemConfigRepository.save(config);
  }

  async deleteSystemConfig(id: string): Promise<void> {
    const result = await this.systemConfigRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`System config with ID ${id} not found`);
    }
  }

  async createMaintenanceWindow(
    startTime: Date,
    endTime: Date,
    description: string,
    createdBy: string,
  ): Promise<SystemMaintenance> {
    const maintenance = this.systemMaintenanceRepository.create({
      startTime,
      endTime,
      description,
      createdBy: { id: createdBy },
      isActive: true,
    });
    
    return this.systemMaintenanceRepository.save(maintenance);
  }

  async getCurrentMaintenance(): Promise<SystemMaintenance | null> {
    const now = new Date();
    
    return this.systemMaintenanceRepository.findOne({
      where: {
        startTime: LessThanOrEqual(now),
        endTime: GreaterThanOrEqual(now),
        isActive: true,
      },
    });
  }

  async completeMaintenance(id: string): Promise<void> {
    const maintenance = await this.systemMaintenanceRepository.findOne({ where: { id } });
    
    if (!maintenance) {
      throw new NotFoundException(`Maintenance window with ID ${id} not found`);
    }
    
    maintenance.isActive = false;
    await this.systemMaintenanceRepository.save(maintenance);
  }

  async generateApiKey(
    name: string,
    permissions: string[],
    expiresAt?: Date,
  ): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create({
      name,
      key: `mc_${uuidv4()}`,
      permissions,
      expiresAt,
      isActive: true,
    });
    
    return this.apiKeyRepository.save(apiKey);
  }

  async validateApiKey(key: string): Promise<boolean> {
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

  async revokeApiKey(id: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
    
    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);
  }

  async getDashboardStats(): Promise<any> {
    const totalAdmins = await this.adminUserRepository.count();
    const activeAdmins = await this.adminUserRepository.count({ where: { isActive: true } });
    const recentActions = await this.adminActionRepository.count({
      where: {
        createdAt: Between(
          new Date(new Date().setHours(0, 0, 0, 0)),
          new Date(new Date().setHours(23, 59, 59, 999)),
        ),
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
}

function LessThanOrEqual(date: Date) {
  return { $lte: date };
}

function GreaterThanOrEqual(date: Date) {
  return { $gte: date };
}