import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLog, AuditSeverity } from './entities/audit-log.entity';
import { AccessLog, AccessSeverity } from './entities/access-log.entity';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'severity', enum: AuditSeverity, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('severity') severity?: AuditSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: AuditLog[]; total: number }> {
    return this.auditService.getAuditLogs({
      userId,
      action,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('access')
  @ApiOperation({ summary: 'Get access logs with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return access logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'ipAddress', required: false })
  @ApiQuery({ name: 'severity', enum: AccessSeverity, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccessLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('ipAddress') ipAddress?: string,
    @Query('severity') severity?: AccessSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: AccessLog[]; total: number }> {
    return this.auditService.getAccessLogs({
      userId,
      action,
      ipAddress,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return user audit logs' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserAuditLogs(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<AuditLog[]> {
    return this.auditService.getUserAuditLogs(userId, limit, offset);
  }

  @Get('ip/:ipAddress')
  @ApiOperation({ summary: 'Get access logs by IP address' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return IP access logs' })
  @ApiParam({ name: 'ipAddress', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccessLogsByIp(
    @Param('ipAddress') ipAddress: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<AccessLog[]> {
    return this.auditService.getAccessLogsByIp(ipAddress, limit, offset);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return audit log' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Audit log not found' })
  @ApiParam({ name: 'id', type: 'string' })
  async getAuditLogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuditLog> {
    return this.auditService.getAuditLogById(id);
  }

  @Get('access/:id')
  @ApiOperation({ summary: 'Get access log by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return access log' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Access log not found' })
  @ApiParam({ name: 'id', type: 'string' })
  async getAccessLogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccessLog> {
    return this.auditService.getAccessLogById(id);
  }

  @Get('statistics/:timeframe')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return audit statistics' })
  @ApiParam({ name: 'timeframe', enum: ['day', 'week', 'month', 'year'] })
  async getAuditStatistics(
    @Param('timeframe') timeframe: 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    return this.auditService.getAuditStatistics(timeframe);
  }

  @Get('summary/user/:userId')
  @ApiOperation({ summary: 'Get audit summary for a specific user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return user audit summary' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getUserAuditSummary(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<{
    totalAudits: number;
    totalAccesses: number;
    lastActivity: Date | null;
    severityBreakdown: any;
  }> {
    const [auditLogs, accessLogs] = await Promise.all([
      this.auditService.getUserAuditLogs(userId, 1, 0),
      this.auditService.getAccessLogs({ userId, limit: 1 }),
    ]);

    const severityBreakdown = await this.auditService['auditLogRepository']
      .createQueryBuilder('log')
      .select('log.severity', 'severity')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.userId = :userId', { userId })
      .groupBy('log.severity')
      .getRawMany();

    return {
      totalAudits: await this.auditService['auditLogRepository'].count({ where: { userId } }),
      totalAccesses: await this.auditService['accessLogRepository'].count({ where: { userId } }),
      lastActivity: auditLogs[0]?.timestamp || accessLogs.items[0]?.timestamp || null,
      severityBreakdown,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check audit service health' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    // Test database connection
    await this.auditService.getAuditLogs({ limit: 1 });
    
    return {
      status: 'healthy',
      timestamp: new Date(),
    };
  }
}