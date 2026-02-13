import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { GenerateApiKeyDto } from './dto/generate-api-key.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post('users')
  async createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto, @Request() req) {
    const user = await this.adminService.createAdminUser(createAdminUserDto);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'CREATE_ADMIN_USER',
      { userId: user.id, email: user.email },
      req.ip,
      req.headers['user-agent'],
    );
    
    return user;
  }

  @Get('users')
  async getAllAdminUsers() {
    return this.adminService.findAllAdminUsers();
  }

  @Get('users/:id')
  async getAdminUser(@Param('id') id: string) {
    return this.adminService.findAdminUserById(id);
  }

  @Put('users/:id')
  async updateAdminUser(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @Request() req,
  ) {
    const user = await this.adminService.updateAdminUser(id, updateAdminUserDto);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'UPDATE_ADMIN_USER',
      { userId: id },
      req.ip,
      req.headers['user-agent'],
    );
    
    return user;
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateAdminUser(@Param('id') id: string, @Request() req) {
    await this.adminService.deactivateAdminUser(id);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'DEACTIVATE_ADMIN_USER',
      { userId: id },
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('actions')
  async getAdminActions(
    @Query('adminUserId') adminUserId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAdminActions(
      adminUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      action,
    );
  }

  @Post('actions/log')
  async logAdminAction(@Body() adminActionDto: AdminActionDto, @Request() req) {
    return this.adminService.logAdminAction(
      req.user.id,
      adminActionDto.action,
      adminActionDto.details,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('config')
  async getAllConfigs() {
    return this.adminService.getAllSystemConfigs();
  }

  @Get('config/:key')
  async getConfig(@Param('key') key: string, @Query('default') defaultValue?: string) {
    return this.adminService.getSystemConfig(key, defaultValue);
  }

  @Post('config')
  async setConfig(@Body() createSystemConfigDto: CreateSystemConfigDto, @Request() req) {
    const config = await this.adminService.setSystemConfig(createSystemConfigDto);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'SET_SYSTEM_CONFIG',
      { key: createSystemConfigDto.key },
      req.ip,
      req.headers['user-agent'],
    );
    
    return config;
  }

  @Put('config/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() updateSystemConfigDto: UpdateSystemConfigDto,
    @Request() req,
  ) {
    const config = await this.adminService.updateSystemConfig(id, updateSystemConfigDto);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'UPDATE_SYSTEM_CONFIG',
      { configId: id },
      req.ip,
      req.headers['user-agent'],
    );
    
    return config;
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('id') id: string, @Request() req) {
    await this.adminService.deleteSystemConfig(id);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'DELETE_SYSTEM_CONFIG',
      { configId: id },
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('maintenance')
  async createMaintenanceWindow(
    @Body() body: { startTime: Date; endTime: Date; description: string },
    @Request() req,
  ) {
    const maintenance = await this.adminService.createMaintenanceWindow(
      body.startTime,
      body.endTime,
      body.description,
      req.user.id,
    );
    
    await this.adminService.logAdminAction(
      req.user.id,
      'CREATE_MAINTENANCE',
      { maintenanceId: maintenance.id },
      req.ip,
      req.headers['user-agent'],
    );
    
    return maintenance;
  }

  @Get('maintenance/current')
  async getCurrentMaintenance() {
    return this.adminService.getCurrentMaintenance();
  }

  @Put('maintenance/:id/complete')
  async completeMaintenance(@Param('id') id: string, @Request() req) {
    await this.adminService.completeMaintenance(id);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'COMPLETE_MAINTENANCE',
      { maintenanceId: id },
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('api-keys')
  async generateApiKey(@Body() generateApiKeyDto: GenerateApiKeyDto, @Request() req) {
    const expiresAt = generateApiKeyDto.expiresAt 
      ? new Date(generateApiKeyDto.expiresAt) 
      : undefined;
    
    const apiKey = await this.adminService.generateApiKey(
      generateApiKeyDto.name,
      generateApiKeyDto.permissions,
      expiresAt,
    );
    
    await this.adminService.logAdminAction(
      req.user.id,
      'GENERATE_API_KEY',
      { keyId: apiKey.id, name: apiKey.name },
      req.ip,
      req.headers['user-agent'],
    );
    
    return apiKey;
  }

  @Post('api-keys/validate')
  @HttpCode(HttpStatus.OK)
  async validateApiKey(@Body() body: { key: string }) {
    const isValid = await this.adminService.validateApiKey(body.key);
    return { valid: isValid };
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(@Param('id') id: string, @Request() req) {
    await this.adminService.revokeApiKey(id);
    
    await this.adminService.logAdminAction(
      req.user.id,
      'REVOKE_API_KEY',
      { keyId: id },
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'admin-module',
    };
  }
}