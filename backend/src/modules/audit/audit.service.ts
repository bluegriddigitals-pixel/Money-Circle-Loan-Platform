import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog, AuditSeverity } from './entities/audit-log.entity';
import { AccessLog, AccessSeverity } from './entities/access-log.entity';
import { Request } from 'express';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
  ) {}

  /**
   * Log an audit event
   */
  async logAudit(
    userId: string | null,
    action: string,
    details: string,
    request?: Request,
    severity: AuditSeverity = AuditSeverity.LOW,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    try {
      const ipAddress = this.getClientIp(request);
      const userAgent = this.getUserAgent(request);

      const auditLog = this.auditLogRepository.create({
        userId: userId || null,
        action,
        details,
        ipAddress,
        userAgent,
        severity,
        metadata,
        timestamp: new Date(),
      });

      const saved = await this.auditLogRepository.save(auditLog);
      
      if (severity === AuditSeverity.HIGH || severity === AuditSeverity.CRITICAL) {
        this.logger.warn(`High severity audit: ${action} - ${details} - User: ${userId}`);
      }

      return saved;
    } catch (error) {
      this.logger.error(`Failed to log audit: ${error.message}`, error.stack);
      // Don't throw - logging should not break the main flow
      return null;
    }
  }

  /**
   * Log an access attempt
   */
  async logAccess(
    userId: string | null,
    action: string,
    details: string,
    request: Request,
    severity: AccessSeverity = AccessSeverity.MEDIUM,
    metadata?: Record<string, any>,
  ): Promise<AccessLog> {
    try {
      const ipAddress = this.getClientIp(request);
      const userAgent = this.getUserAgent(request);

      const accessLog = this.accessLogRepository.create({
        userId: userId || null,
        action,
        details,
        ipAddress,
        userAgent,
        severity,
        metadata,
        timestamp: new Date(),
      });

      const saved = await this.accessLogRepository.save(accessLog);
      
      if (severity === AccessSeverity.HIGH || severity === AccessSeverity.CRITICAL) {
        this.logger.warn(`High severity access: ${action} - ${details} - IP: ${ipAddress}`);
      }

      return saved;
    } catch (error) {
      this.logger.error(`Failed to log access: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AuditLog[]; total: number }> {
    const where: FindOptionsWhere<AuditLog> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.severity) where.severity = filters.severity;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = Between(
        filters.startDate || new Date('1970-01-01'),
        filters.endDate || new Date(),
      );
    }

    const [items, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return { items, total };
  }

  /**
   * Get access logs with filters
   */
  async getAccessLogs(filters: {
    userId?: string;
    action?: string;
    ipAddress?: string;
    severity?: AccessSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AccessLog[]; total: number }> {
    const where: FindOptionsWhere<AccessLog> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.ipAddress) where.ipAddress = filters.ipAddress;
    if (filters.severity) where.severity = filters.severity;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = Between(
        filters.startDate || new Date('1970-01-01'),
        filters.endDate || new Date(),
      );
    }

    const [items, total] = await this.accessLogRepository.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return { items, total };
  }

  /**
   * Get audit logs by user ID
   */
  async getUserAuditLogs(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get access logs by IP address
   */
  async getAccessLogsByIp(
    ipAddress: string,
    limit = 50,
    offset = 0,
  ): Promise<AccessLog[]> {
    return this.accessLogRepository.find({
      where: { ipAddress },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLog> {
    return this.auditLogRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get access log by ID
   */
  async getAccessLogById(id: string): Promise<AccessLog> {
    return this.accessLogRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(timeframe: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    // Get audit logs count by severity
    const auditBySeverity = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.severity', 'severity')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp >= :startDate', { startDate })
      .groupBy('log.severity')
      .getRawMany();

    // Get access logs count by severity
    const accessBySeverity = await this.accessLogRepository
      .createQueryBuilder('log')
      .select('log.severity', 'severity')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp >= :startDate', { startDate })
      .groupBy('log.severity')
      .getRawMany();

    // Get top users by audit count
    const topUsers = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp >= :startDate', { startDate })
      .andWhere('log.userId IS NOT NULL')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get top IPs by access count
    const topIps = await this.accessLogRepository
      .createQueryBuilder('log')
      .select('log.ipAddress', 'ipAddress')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.timestamp >= :startDate', { startDate })
      .groupBy('log.ipAddress')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      timeframe,
      startDate,
      endDate: now,
      auditLogs: {
        total: await this.auditLogRepository.count({ where: { timestamp: Between(startDate, now) } }),
        bySeverity: auditBySeverity,
      },
      accessLogs: {
        total: await this.accessLogRepository.count({ where: { timestamp: Between(startDate, now) } }),
        bySeverity: accessBySeverity,
      },
      topUsers,
      topIps,
    };
  }

  /**
   * Clean old audit logs
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Clean old access logs
   */
  async cleanOldAccessLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.accessLogRepository
      .createQueryBuilder()
      .delete()
      .from(AccessLog)
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request?: Request): string {
    if (!request) return '127.0.0.1';
    
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    }
    
    return request.ip || request.connection?.remoteAddress || '127.0.0.1';
  }

  /**
   * Get user agent from request
   */
  private getUserAgent(request?: Request): string {
    if (!request) return 'Unknown';
    return request.headers['user-agent'] || 'Unknown';
  }
}