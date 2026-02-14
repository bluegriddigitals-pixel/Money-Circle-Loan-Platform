import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Kyc, KycStatus } from './entities/kyc.entity';
import { KycDocument, KycDocumentStatus, KycDocumentType } from './entities/kyc-document.entity';
import { ComplianceCheck, ComplianceCheckType, ComplianceCheckStatus, ComplianceCheckResult } from './entities/compliance-check.entity';
import { SanctionScreening, SanctionScreeningStatus, SanctionMatchStatus, RiskLevel } from './entities/sanction-screening.entity';
import { AmlAlert, AmlAlertStatus, AmlAlertSeverity, AmlAlertType } from './entities/aml-alert.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(KycDocument)
    private kycDocumentRepository: Repository<KycDocument>,
    @InjectRepository(ComplianceCheck)
    private complianceCheckRepository: Repository<ComplianceCheck>,
    @InjectRepository(SanctionScreening)
    private sanctionScreeningRepository: Repository<SanctionScreening>,
    @InjectRepository(AmlAlert)
    private amlAlertRepository: Repository<AmlAlert>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  // ============ KYC METHODS ============

  async getKycById(id: string): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { id },
      relations: ['user', 'documents']
    });

    if (!kyc) {
      throw new NotFoundException(`KYC with ID ${id} not found`);
    }

    return kyc;
  }

  async getKycByUserId(userId: string): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { userId },
      relations: ['documents']
    });

    if (!kyc) {
      throw new NotFoundException(`KYC for user ${userId} not found`);
    }

    return kyc;
  }

  async initiateKyc(userId: string): Promise<Kyc> {
    const existingKyc = await this.kycRepository.findOne({
      where: { userId }
    });

    if (existingKyc) {
      return existingKyc;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kyc = this.kycRepository.create({
      userId,
      status: KycStatus.INITIATED,
    });

    return this.kycRepository.save(kyc);
  }

  async submitKyc(kycId: string): Promise<Kyc> {
    const kyc = await this.getKycById(kycId);
    
    kyc.status = KycStatus.SUBMITTED;
    kyc.submittedAt = new Date();

    const updatedKyc = await this.kycRepository.save(kyc);

    const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
    if (user) {
      await this.notificationService.sendSecurityAlert(
        user,
        'KYC_SUBMITTED',
        { kycId }
      );
    }

    return updatedKyc;
  }

  async approveKyc(kycId: string, reviewerId: string, notes?: string): Promise<Kyc> {
    const kyc = await this.getKycById(kycId);

    kyc.status = KycStatus.APPROVED;
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.reviewNotes = notes;

    const updatedKyc = await this.kycRepository.save(kyc);

    await this.userRepository.update(kyc.userId, { kycStatus: KycStatus.APPROVED });

    const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
    if (user) {
      await this.notificationService.sendEmailVerifiedNotification(user);
    }

    return updatedKyc;
  }

  async rejectKyc(kycId: string, reviewerId: string, reason: string): Promise<Kyc> {
    const kyc = await this.getKycById(kycId);

    kyc.status = KycStatus.REJECTED;
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = reason;

    const updatedKyc = await this.kycRepository.save(kyc);

    const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
    if (user) {
      await this.notificationService.sendSecurityAlert(
        user,
        'KYC_REJECTED',
        { reason }
      );
    }

    return updatedKyc;
  }

  async returnKyc(kycId: string, reviewerId: string, reason: string): Promise<Kyc> {
    const kyc = await this.getKycById(kycId);

    kyc.status = KycStatus.RETURNED;
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.returnReason = reason;

    return this.kycRepository.save(kyc);
  }

  async expireKyc(kycId: string): Promise<Kyc> {
    const kyc = await this.getKycById(kycId);

    kyc.status = KycStatus.EXPIRED;
    kyc.expiredAt = new Date();

    return this.kycRepository.save(kyc);
  }

  async getAllKyc(
    page: number = 1, 
    limit: number = 10, 
    filters?: { status?: string; userId?: string; startDate?: Date; endDate?: Date; }
  ): Promise<{ items: Kyc[]; total: number }> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = Between(
        filters.startDate || new Date(0),
        filters.endDate || new Date()
      );
    }

    const [items, total] = await this.kycRepository.findAndCount({
      where,
      relations: ['user', 'documents'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async getPendingKycCount(): Promise<number> {
    return this.kycRepository.count({
      where: { status: KycStatus.SUBMITTED }
    });
  }

  // ============ DOCUMENT METHODS ============

  async uploadDocument(kycId: string, documentData: Partial<KycDocument>): Promise<KycDocument> {
    const kyc = await this.getKycById(kycId);

    const document = this.kycDocumentRepository.create({
      kycId,
      ...documentData,
      status: KycDocumentStatus.PENDING,
      uploadedAt: new Date(),
    });

    return this.kycDocumentRepository.save(document);
  }

  async getDocumentById(id: string): Promise<KycDocument> {
    const document = await this.kycDocumentRepository.findOne({
      where: { id },
      relations: ['kyc']
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async getDocumentsByKycId(kycId: string): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({
      where: { kycId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async verifyDocument(id: string, verifierId: string): Promise<KycDocument> {
    const document = await this.getDocumentById(id);

    document.status = KycDocumentStatus.VERIFIED;
    document.verifiedBy = verifierId;
    document.verifiedAt = new Date();

    return this.kycDocumentRepository.save(document);
  }

  async rejectDocument(id: string, reason: string): Promise<KycDocument> {
    const document = await this.getDocumentById(id);

    document.status = KycDocumentStatus.REJECTED;
    document.rejectionReason = reason;

    return this.kycDocumentRepository.save(document);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.kycDocumentRepository.softDelete(id);
  }

  // ============ COMPLIANCE CHECK METHODS ============

  async getComplianceCheckById(id: string): Promise<ComplianceCheck> {
    const check = await this.complianceCheckRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!check) {
      throw new NotFoundException(`Compliance check with ID ${id} not found`);
    }

    return check;
  }

  async getComplianceChecksByUserId(userId: string): Promise<ComplianceCheck[]> {
    return this.complianceCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async runComplianceChecks(userId: string): Promise<ComplianceCheck[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checks: ComplianceCheck[] = [];

    const identityCheck = this.complianceCheckRepository.create({
      userId,
      checkType: ComplianceCheckType.IDENTITY,
      status: ComplianceCheckStatus.COMPLETED,
      result: ComplianceCheckResult.PASS,
      completedAt: new Date(),
    });
    checks.push(await this.complianceCheckRepository.save(identityCheck));

    const sanctionsCheck = this.complianceCheckRepository.create({
      userId,
      checkType: ComplianceCheckType.SANCTIONS,
      status: ComplianceCheckStatus.COMPLETED,
      result: ComplianceCheckResult.PASS,
      completedAt: new Date(),
    });
    checks.push(await this.complianceCheckRepository.save(sanctionsCheck));

    const amlCheck = this.complianceCheckRepository.create({
      userId,
      checkType: ComplianceCheckType.AML,
      status: ComplianceCheckStatus.COMPLETED,
      result: ComplianceCheckResult.PASS,
      completedAt: new Date(),
    });
    checks.push(await this.complianceCheckRepository.save(amlCheck));

    return checks;
  }

  async getAllComplianceChecks(
    page: number = 1, 
    limit: number = 10, 
    filters?: { userId?: string; checkType?: string; result?: string; startDate?: Date; endDate?: Date; }
  ): Promise<{ items: ComplianceCheck[]; total: number }> {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.checkType) where.checkType = filters.checkType;
    if (filters?.result) where.result = filters.result;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = Between(
        filters.startDate || new Date(0),
        filters.endDate || new Date()
      );
    }

    const [items, total] = await this.complianceCheckRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  // ============ SANCTION SCREENING METHODS ============

  async getSanctionScreeningById(id: string): Promise<SanctionScreening> {
    const screening = await this.sanctionScreeningRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!screening) {
      throw new NotFoundException(`Sanction screening with ID ${id} not found`);
    }

    return screening;
  }

  async getSanctionScreeningsByUserId(userId: string): Promise<SanctionScreening[]> {
    return this.sanctionScreeningRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async screenUser(userId: string): Promise<SanctionScreening> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const screening = this.sanctionScreeningRepository.create({
      userId,
      status: SanctionScreeningStatus.COMPLETED,
      matchStatus: SanctionMatchStatus.NO_MATCH,
      riskLevel: RiskLevel.LOW,
      matches: [],
      screenedAt: new Date(),
      completedAt: new Date(),
    });

    return this.sanctionScreeningRepository.save(screening);
  }

  async getAllSanctionScreenings(
    page: number = 1, 
    limit: number = 10, 
    filters?: { userId?: string; riskLevel?: string; matchStatus?: string; startDate?: Date; endDate?: Date; }
  ): Promise<{ items: SanctionScreening[]; total: number }> {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters?.matchStatus) where.matchStatus = filters.matchStatus;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = Between(
        filters.startDate || new Date(0),
        filters.endDate || new Date()
      );
    }

    const [items, total] = await this.sanctionScreeningRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  // ============ AML ALERT METHODS ============

  async getAmlAlertById(id: string): Promise<AmlAlert> {
    const alert = await this.amlAlertRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!alert) {
      throw new NotFoundException(`AML alert with ID ${id} not found`);
    }

    return alert;
  }

  async getAmlAlertsByUserId(userId: string): Promise<AmlAlert[]> {
    return this.amlAlertRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<AmlAlert> {
    const alert = await this.getAmlAlertById(alertId);

    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    alert.status = AmlAlertStatus.ACKNOWLEDGED;

    return this.amlAlertRepository.save(alert);
  }

  async resolveAlert(alertId: string, userId: string, resolution: string): Promise<AmlAlert> {
    const alert = await this.getAmlAlertById(alertId);

    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();
    alert.resolution = resolution;
    alert.status = AmlAlertStatus.RESOLVED;

    return this.amlAlertRepository.save(alert);
  }

  async escalateAlert(alertId: string, userId: string, reason: string): Promise<AmlAlert> {
    const alert = await this.getAmlAlertById(alertId);

    alert.escalatedBy = userId;
    alert.escalatedAt = new Date();
    alert.escalationReason = reason;
    alert.status = AmlAlertStatus.ESCALATED;

    return this.amlAlertRepository.save(alert);
  }

  async getAllAmlAlerts(
    page: number = 1, 
    limit: number = 10, 
    filters?: { userId?: string; status?: AmlAlertStatus; severity?: AmlAlertSeverity; alertType?: AmlAlertType; startDate?: Date; endDate?: Date; }
  ): Promise<{ items: AmlAlert[]; total: number }> {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.alertType) where.alertType = filters.alertType;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = Between(
        filters.startDate || new Date(0),
        filters.endDate || new Date()
      );
    }

    const [items, total] = await this.amlAlertRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async getPendingAlertsCount(): Promise<number> {
    return this.amlAlertRepository.count({
      where: { status: AmlAlertStatus.PENDING }
    });
  }

  // ============ USER COMPLIANCE METHODS ============

  async getUserComplianceStatus(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kyc = await this.kycRepository.findOne({ where: { userId } });
    const checks = await this.complianceCheckRepository.count({ where: { userId } });
    const alerts = await this.amlAlertRepository.count({ where: { userId, status: AmlAlertStatus.PENDING } });

    return {
      userId,
      kycStatus: kyc?.status || KycStatus.NOT_STARTED,
      kycSubmitted: !!kyc?.submittedAt,
      kycApproved: kyc?.status === KycStatus.APPROVED,
      complianceChecks: checks,
      pendingAlerts: alerts,
      isCompliant: kyc?.status === KycStatus.APPROVED && alerts === 0,
    };
  }

  async getUserComplianceSummary(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kyc = await this.kycRepository.findOne({ 
      where: { userId },
      relations: ['documents']
    });

    const checks = await this.complianceCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const sanctions = await this.sanctionScreeningRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const alerts = await this.amlAlertRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      kyc,
      complianceChecks: checks,
      sanctionScreenings: sanctions,
      amlAlerts: alerts,
    };
  }

  async initializeUserCompliance(userId: string): Promise<any> {
    const kyc = await this.initiateKyc(userId);
    const checks = await this.runComplianceChecks(userId);
    const screening = await this.screenUser(userId);

    return {
      kyc,
      checks,
      screening,
    };
  }

  async refreshUserCompliance(userId: string): Promise<any> {
    const checks = await this.runComplianceChecks(userId);
    const screening = await this.screenUser(userId);

    return {
      checks,
      screening,
    };
  }

  // ============ STATISTICS METHODS ============

  async getComplianceStatistics(): Promise<any> {
    const totalKyc = await this.kycRepository.count();
    const pendingKyc = await this.kycRepository.count({ 
      where: { status: KycStatus.SUBMITTED } 
    });
    const approvedKyc = await this.kycRepository.count({ 
      where: { status: KycStatus.APPROVED } 
    });
    const rejectedKyc = await this.kycRepository.count({ 
      where: { status: KycStatus.REJECTED } 
    });

    const totalChecks = await this.complianceCheckRepository.count();
    const failedChecks = await this.complianceCheckRepository.count({ 
      where: { result: ComplianceCheckResult.FAIL } 
    });

    const totalAlerts = await this.amlAlertRepository.count();
    const pendingAlerts = await this.amlAlertRepository.count({ 
      where: { status: AmlAlertStatus.PENDING } 
    });

    return {
      kyc: {
        total: totalKyc,
        pending: pendingKyc,
        approved: approvedKyc,
        rejected: rejectedKyc,
        approvalRate: totalKyc > 0 ? (approvedKyc / totalKyc) * 100 : 0,
      },
      complianceChecks: {
        total: totalChecks,
        failed: failedChecks,
        passRate: totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks) * 100 : 0,
      },
      amlAlerts: {
        total: totalAlerts,
        pending: pendingAlerts,
        resolutionRate: totalAlerts > 0 ? ((totalAlerts - pendingAlerts) / totalAlerts) * 100 : 0,
      },
    };
  }

  async getKycStatistics(timeframe?: string): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const kycList = await this.kycRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    const byStatus = {
      initiated: kycList.filter(k => k.status === KycStatus.INITIATED).length,
      submitted: kycList.filter(k => k.status === KycStatus.SUBMITTED).length,
      approved: kycList.filter(k => k.status === KycStatus.APPROVED).length,
      rejected: kycList.filter(k => k.status === KycStatus.REJECTED).length,
      returned: kycList.filter(k => k.status === KycStatus.RETURNED).length,
      expired: kycList.filter(k => k.status === KycStatus.EXPIRED).length,
    };

    return {
      timeframe,
      total: kycList.length,
      byStatus,
    };
  }

  async getAmlAlertsStatistics(timeframe?: string): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const alerts = await this.amlAlertRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    const bySeverity = {
      low: alerts.filter(a => a.severity === AmlAlertSeverity.LOW).length,
      medium: alerts.filter(a => a.severity === AmlAlertSeverity.MEDIUM).length,
      high: alerts.filter(a => a.severity === AmlAlertSeverity.HIGH).length,
      critical: alerts.filter(a => a.severity === AmlAlertSeverity.CRITICAL).length,
    };

    const byStatus = {
      pending: alerts.filter(a => a.status === AmlAlertStatus.PENDING).length,
      acknowledged: alerts.filter(a => a.status === AmlAlertStatus.ACKNOWLEDGED).length,
      resolved: alerts.filter(a => a.status === AmlAlertStatus.RESOLVED).length,
      escalated: alerts.filter(a => a.status === AmlAlertStatus.ESCALATED).length,
    };

    return {
      timeframe,
      total: alerts.length,
      bySeverity,
      byStatus,
    };
  }

  async getSanctionsStatistics(timeframe?: string): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const screenings = await this.sanctionScreeningRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    const byRiskLevel = {
      low: screenings.filter(s => s.riskLevel === RiskLevel.LOW).length,
      medium: screenings.filter(s => s.riskLevel === RiskLevel.MEDIUM).length,
      high: screenings.filter(s => s.riskLevel === RiskLevel.HIGH).length,
      critical: screenings.filter(s => s.riskLevel === RiskLevel.CRITICAL).length,
    };

    const withMatches = screenings.filter(s => s.matches && s.matches.length > 0).length;

    return {
      timeframe,
      total: screenings.length,
      byRiskLevel,
      withMatches,
      matchRate: screenings.length > 0 ? (withMatches / screenings.length) * 100 : 0,
    };
  }

  // ============ REPORTING METHODS ============

  async generateDailyReport(date?: Date): Promise<any> {
    const reportDate = date || new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    const kycSubmitted = await this.kycRepository.count({
      where: {
        submittedAt: Between(startOfDay, endOfDay),
      },
    });

    const kycApproved = await this.kycRepository.count({
      where: {
        reviewedAt: Between(startOfDay, endOfDay),
        status: KycStatus.APPROVED,
      },
    });

    const kycRejected = await this.kycRepository.count({
      where: {
        reviewedAt: Between(startOfDay, endOfDay),
        status: KycStatus.REJECTED,
      },
    });

    const alertsGenerated = await this.amlAlertRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    return {
      date: startOfDay.toISOString().split('T')[0],
      kyc: {
        submitted: kycSubmitted,
        approved: kycApproved,
        rejected: kycRejected,
      },
      alerts: {
        generated: alertsGenerated,
      },
    };
  }

  async generateWeeklyReport(): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const kycSubmitted = await this.kycRepository.count({
      where: {
        submittedAt: Between(startDate, endDate),
      },
    });

    const kycApproved = await this.kycRepository.count({
      where: {
        reviewedAt: Between(startDate, endDate),
        status: KycStatus.APPROVED,
      },
    });

    const checksRun = await this.complianceCheckRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const alertsGenerated = await this.amlAlertRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    return {
      weekStarting: startDate.toISOString().split('T')[0],
      weekEnding: endDate.toISOString().split('T')[0],
      kyc: {
        submitted: kycSubmitted,
        approved: kycApproved,
      },
      compliance: {
        checksRun,
      },
      alerts: {
        generated: alertsGenerated,
      },
    };
  }

  async generateMonthlyReport(): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const kycSubmitted = await this.kycRepository.count({
      where: {
        submittedAt: Between(startDate, endDate),
      },
    });

    const kycApproved = await this.kycRepository.count({
      where: {
        reviewedAt: Between(startDate, endDate),
        status: KycStatus.APPROVED,
      },
    });

    const checksRun = await this.complianceCheckRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const screeningsRun = await this.sanctionScreeningRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const alertsGenerated = await this.amlAlertRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const alertsResolved = await this.amlAlertRepository.count({
      where: {
        resolvedAt: Between(startDate, endDate),
      },
    });

    return {
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: startDate.getFullYear(),
      kyc: {
        submitted: kycSubmitted,
        approved: kycApproved,
      },
      compliance: {
        checksRun,
        screeningsRun,
      },
      alerts: {
        generated: alertsGenerated,
        resolved: alertsResolved,
      },
    };
  }

  // ============ DASHBOARD METHODS ============

  async getDashboardSummary(): Promise<any> {
    const [
      pendingKyc,
      pendingAlerts,
      totalUsers,
      totalKyc,
      recentKyc,
      recentAlerts
    ] = await Promise.all([
      this.kycRepository.count({ where: { status: KycStatus.SUBMITTED } }),
      this.amlAlertRepository.count({ where: { status: AmlAlertStatus.PENDING } }),
      this.userRepository.count(),
      this.kycRepository.count(),
      this.kycRepository.find({
        where: { status: KycStatus.SUBMITTED },
        relations: ['user'],
        order: { submittedAt: 'DESC' },
        take: 5,
      }),
      this.amlAlertRepository.find({
        where: { status: AmlAlertStatus.PENDING },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      summary: {
        pendingKyc,
        pendingAlerts,
        totalUsers,
        totalKyc,
        completionRate: totalUsers > 0 ? (totalKyc / totalUsers) * 100 : 0,
      },
      recentKyc,
      recentAlerts,
    };
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const activities = [];

    const recentKyc = await this.kycRepository.find({
      where: { status: KycStatus.SUBMITTED },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
      take: limit,
    });

    recentKyc.forEach(kyc => {
      activities.push({
        type: 'kyc_submission',
        id: kyc.id,
        user: kyc.user ? `${kyc.user.firstName} ${kyc.user.lastName}` : 'Unknown',
        timestamp: kyc.submittedAt,
        description: `KYC submitted by user`,
      });
    });

    const recentAlerts = await this.amlAlertRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    recentAlerts.forEach(alert => {
      activities.push({
        type: 'aml_alert',
        id: alert.id,
        user: alert.user ? `${alert.user.firstName} ${alert.user.lastName}` : 'Unknown',
        timestamp: alert.createdAt,
        severity: alert.severity,
        description: alert.description,
      });
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  }

  async getPendingItems(): Promise<any> {
    const [pendingKyc, pendingAlerts] = await Promise.all([
      this.kycRepository.find({
        where: { status: KycStatus.SUBMITTED },
        relations: ['user'],
        order: { submittedAt: 'ASC' },
      }),
      this.amlAlertRepository.find({
        where: { status: AmlAlertStatus.PENDING },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      }),
    ]);

    return {
      kyc: pendingKyc.map(k => ({
        id: k.id,
        user: k.user ? `${k.user.firstName} ${k.user.lastName}` : 'Unknown',
        submittedAt: k.submittedAt,
      })),
      alerts: pendingAlerts.map(a => ({
        id: a.id,
        user: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Unknown',
        severity: a.severity,
        createdAt: a.createdAt,
        description: a.description,
      })),
    };
  }

  // ============ HEALTH CHECK ============

  async healthCheck(): Promise<any> {
    try {
      await this.kycRepository.count({ take: 1 });

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
        },
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
