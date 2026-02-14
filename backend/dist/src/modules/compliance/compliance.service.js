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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kyc_entity_1 = require("./entities/kyc.entity");
const kyc_document_entity_1 = require("./entities/kyc-document.entity");
const compliance_check_entity_1 = require("./entities/compliance-check.entity");
const sanction_screening_entity_1 = require("./entities/sanction-screening.entity");
const aml_alert_entity_1 = require("./entities/aml-alert.entity");
const notification_service_1 = require("../notification/notification.service");
const user_entity_1 = require("../user/entities/user.entity");
let ComplianceService = ComplianceService_1 = class ComplianceService {
    constructor(kycRepository, kycDocumentRepository, complianceCheckRepository, sanctionScreeningRepository, amlAlertRepository, userRepository, notificationService) {
        this.kycRepository = kycRepository;
        this.kycDocumentRepository = kycDocumentRepository;
        this.complianceCheckRepository = complianceCheckRepository;
        this.sanctionScreeningRepository = sanctionScreeningRepository;
        this.amlAlertRepository = amlAlertRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(ComplianceService_1.name);
    }
    async getKycById(id) {
        const kyc = await this.kycRepository.findOne({
            where: { id },
            relations: ['user', 'documents']
        });
        if (!kyc) {
            throw new common_1.NotFoundException(`KYC with ID ${id} not found`);
        }
        return kyc;
    }
    async getKycByUserId(userId) {
        const kyc = await this.kycRepository.findOne({
            where: { userId },
            relations: ['documents']
        });
        if (!kyc) {
            throw new common_1.NotFoundException(`KYC for user ${userId} not found`);
        }
        return kyc;
    }
    async initiateKyc(userId) {
        const existingKyc = await this.kycRepository.findOne({
            where: { userId }
        });
        if (existingKyc) {
            return existingKyc;
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const kyc = this.kycRepository.create({
            userId,
            status: kyc_entity_1.KycStatus.INITIATED,
        });
        return this.kycRepository.save(kyc);
    }
    async submitKyc(kycId) {
        const kyc = await this.getKycById(kycId);
        kyc.status = kyc_entity_1.KycStatus.SUBMITTED;
        kyc.submittedAt = new Date();
        const updatedKyc = await this.kycRepository.save(kyc);
        const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
        if (user) {
            await this.notificationService.sendSecurityAlert(user, 'KYC_SUBMITTED', { kycId });
        }
        return updatedKyc;
    }
    async approveKyc(kycId, reviewerId, notes) {
        const kyc = await this.getKycById(kycId);
        kyc.status = kyc_entity_1.KycStatus.APPROVED;
        kyc.reviewedBy = reviewerId;
        kyc.reviewedAt = new Date();
        kyc.reviewNotes = notes;
        const updatedKyc = await this.kycRepository.save(kyc);
        await this.userRepository.update(kyc.userId, { kycStatus: kyc_entity_1.KycStatus.APPROVED });
        const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
        if (user) {
            await this.notificationService.sendEmailVerifiedNotification(user);
        }
        return updatedKyc;
    }
    async rejectKyc(kycId, reviewerId, reason) {
        const kyc = await this.getKycById(kycId);
        kyc.status = kyc_entity_1.KycStatus.REJECTED;
        kyc.reviewedBy = reviewerId;
        kyc.reviewedAt = new Date();
        kyc.rejectionReason = reason;
        const updatedKyc = await this.kycRepository.save(kyc);
        const user = await this.userRepository.findOne({ where: { id: kyc.userId } });
        if (user) {
            await this.notificationService.sendSecurityAlert(user, 'KYC_REJECTED', { reason });
        }
        return updatedKyc;
    }
    async returnKyc(kycId, reviewerId, reason) {
        const kyc = await this.getKycById(kycId);
        kyc.status = kyc_entity_1.KycStatus.RETURNED;
        kyc.reviewedBy = reviewerId;
        kyc.reviewedAt = new Date();
        kyc.returnReason = reason;
        return this.kycRepository.save(kyc);
    }
    async expireKyc(kycId) {
        const kyc = await this.getKycById(kycId);
        kyc.status = kyc_entity_1.KycStatus.EXPIRED;
        kyc.expiredAt = new Date();
        return this.kycRepository.save(kyc);
    }
    async getAllKyc(page = 1, limit = 10, filters) {
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = (0, typeorm_2.Between)(filters.startDate || new Date(0), filters.endDate || new Date());
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
    async getPendingKycCount() {
        return this.kycRepository.count({
            where: { status: kyc_entity_1.KycStatus.SUBMITTED }
        });
    }
    async uploadDocument(kycId, documentData) {
        const kyc = await this.getKycById(kycId);
        const document = this.kycDocumentRepository.create({
            kycId,
            ...documentData,
            status: kyc_document_entity_1.KycDocumentStatus.PENDING,
            uploadedAt: new Date(),
        });
        return this.kycDocumentRepository.save(document);
    }
    async getDocumentById(id) {
        const document = await this.kycDocumentRepository.findOne({
            where: { id },
            relations: ['kyc']
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        return document;
    }
    async getDocumentsByKycId(kycId) {
        return this.kycDocumentRepository.find({
            where: { kycId },
            order: { uploadedAt: 'DESC' },
        });
    }
    async verifyDocument(id, verifierId) {
        const document = await this.getDocumentById(id);
        document.status = kyc_document_entity_1.KycDocumentStatus.VERIFIED;
        document.verifiedBy = verifierId;
        document.verifiedAt = new Date();
        return this.kycDocumentRepository.save(document);
    }
    async rejectDocument(id, reason) {
        const document = await this.getDocumentById(id);
        document.status = kyc_document_entity_1.KycDocumentStatus.REJECTED;
        document.rejectionReason = reason;
        return this.kycDocumentRepository.save(document);
    }
    async deleteDocument(id) {
        await this.kycDocumentRepository.softDelete(id);
    }
    async getComplianceCheckById(id) {
        const check = await this.complianceCheckRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!check) {
            throw new common_1.NotFoundException(`Compliance check with ID ${id} not found`);
        }
        return check;
    }
    async getComplianceChecksByUserId(userId) {
        return this.complianceCheckRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async runComplianceChecks(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const checks = [];
        const identityCheck = this.complianceCheckRepository.create({
            userId,
            checkType: compliance_check_entity_1.ComplianceCheckType.IDENTITY,
            status: compliance_check_entity_1.ComplianceCheckStatus.COMPLETED,
            result: compliance_check_entity_1.ComplianceCheckResult.PASS,
            completedAt: new Date(),
        });
        checks.push(await this.complianceCheckRepository.save(identityCheck));
        const sanctionsCheck = this.complianceCheckRepository.create({
            userId,
            checkType: compliance_check_entity_1.ComplianceCheckType.SANCTIONS,
            status: compliance_check_entity_1.ComplianceCheckStatus.COMPLETED,
            result: compliance_check_entity_1.ComplianceCheckResult.PASS,
            completedAt: new Date(),
        });
        checks.push(await this.complianceCheckRepository.save(sanctionsCheck));
        const amlCheck = this.complianceCheckRepository.create({
            userId,
            checkType: compliance_check_entity_1.ComplianceCheckType.AML,
            status: compliance_check_entity_1.ComplianceCheckStatus.COMPLETED,
            result: compliance_check_entity_1.ComplianceCheckResult.PASS,
            completedAt: new Date(),
        });
        checks.push(await this.complianceCheckRepository.save(amlCheck));
        return checks;
    }
    async getAllComplianceChecks(page = 1, limit = 10, filters) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.checkType)
            where.checkType = filters.checkType;
        if (filters?.result)
            where.result = filters.result;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = (0, typeorm_2.Between)(filters.startDate || new Date(0), filters.endDate || new Date());
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
    async getSanctionScreeningById(id) {
        const screening = await this.sanctionScreeningRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!screening) {
            throw new common_1.NotFoundException(`Sanction screening with ID ${id} not found`);
        }
        return screening;
    }
    async getSanctionScreeningsByUserId(userId) {
        return this.sanctionScreeningRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async screenUser(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const screening = this.sanctionScreeningRepository.create({
            userId,
            status: sanction_screening_entity_1.SanctionScreeningStatus.COMPLETED,
            matchStatus: sanction_screening_entity_1.SanctionMatchStatus.NO_MATCH,
            riskLevel: sanction_screening_entity_1.RiskLevel.LOW,
            matches: [],
            screenedAt: new Date(),
            completedAt: new Date(),
        });
        return this.sanctionScreeningRepository.save(screening);
    }
    async getAllSanctionScreenings(page = 1, limit = 10, filters) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.riskLevel)
            where.riskLevel = filters.riskLevel;
        if (filters?.matchStatus)
            where.matchStatus = filters.matchStatus;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = (0, typeorm_2.Between)(filters.startDate || new Date(0), filters.endDate || new Date());
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
    async getAmlAlertById(id) {
        const alert = await this.amlAlertRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!alert) {
            throw new common_1.NotFoundException(`AML alert with ID ${id} not found`);
        }
        return alert;
    }
    async getAmlAlertsByUserId(userId) {
        return this.amlAlertRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async acknowledgeAlert(alertId, userId) {
        const alert = await this.getAmlAlertById(alertId);
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        alert.status = aml_alert_entity_1.AmlAlertStatus.ACKNOWLEDGED;
        return this.amlAlertRepository.save(alert);
    }
    async resolveAlert(alertId, userId, resolution) {
        const alert = await this.getAmlAlertById(alertId);
        alert.resolvedBy = userId;
        alert.resolvedAt = new Date();
        alert.resolution = resolution;
        alert.status = aml_alert_entity_1.AmlAlertStatus.RESOLVED;
        return this.amlAlertRepository.save(alert);
    }
    async escalateAlert(alertId, userId, reason) {
        const alert = await this.getAmlAlertById(alertId);
        alert.escalatedBy = userId;
        alert.escalatedAt = new Date();
        alert.escalationReason = reason;
        alert.status = aml_alert_entity_1.AmlAlertStatus.ESCALATED;
        return this.amlAlertRepository.save(alert);
    }
    async getAllAmlAlerts(page = 1, limit = 10, filters) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.severity)
            where.severity = filters.severity;
        if (filters?.alertType)
            where.alertType = filters.alertType;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = (0, typeorm_2.Between)(filters.startDate || new Date(0), filters.endDate || new Date());
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
    async getPendingAlertsCount() {
        return this.amlAlertRepository.count({
            where: { status: aml_alert_entity_1.AmlAlertStatus.PENDING }
        });
    }
    async getUserComplianceStatus(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const kyc = await this.kycRepository.findOne({ where: { userId } });
        const checks = await this.complianceCheckRepository.count({ where: { userId } });
        const alerts = await this.amlAlertRepository.count({ where: { userId, status: aml_alert_entity_1.AmlAlertStatus.PENDING } });
        return {
            userId,
            kycStatus: kyc?.status || kyc_entity_1.KycStatus.NOT_STARTED,
            kycSubmitted: !!kyc?.submittedAt,
            kycApproved: kyc?.status === kyc_entity_1.KycStatus.APPROVED,
            complianceChecks: checks,
            pendingAlerts: alerts,
            isCompliant: kyc?.status === kyc_entity_1.KycStatus.APPROVED && alerts === 0,
        };
    }
    async getUserComplianceSummary(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async initializeUserCompliance(userId) {
        const kyc = await this.initiateKyc(userId);
        const checks = await this.runComplianceChecks(userId);
        const screening = await this.screenUser(userId);
        return {
            kyc,
            checks,
            screening,
        };
    }
    async refreshUserCompliance(userId) {
        const checks = await this.runComplianceChecks(userId);
        const screening = await this.screenUser(userId);
        return {
            checks,
            screening,
        };
    }
    async getComplianceStatistics() {
        const totalKyc = await this.kycRepository.count();
        const pendingKyc = await this.kycRepository.count({
            where: { status: kyc_entity_1.KycStatus.SUBMITTED }
        });
        const approvedKyc = await this.kycRepository.count({
            where: { status: kyc_entity_1.KycStatus.APPROVED }
        });
        const rejectedKyc = await this.kycRepository.count({
            where: { status: kyc_entity_1.KycStatus.REJECTED }
        });
        const totalChecks = await this.complianceCheckRepository.count();
        const failedChecks = await this.complianceCheckRepository.count({
            where: { result: compliance_check_entity_1.ComplianceCheckResult.FAIL }
        });
        const totalAlerts = await this.amlAlertRepository.count();
        const pendingAlerts = await this.amlAlertRepository.count({
            where: { status: aml_alert_entity_1.AmlAlertStatus.PENDING }
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
    async getKycStatistics(timeframe) {
        const now = new Date();
        let startDate;
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
                createdAt: (0, typeorm_2.Between)(startDate, new Date()),
            },
        });
        const byStatus = {
            initiated: kycList.filter(k => k.status === kyc_entity_1.KycStatus.INITIATED).length,
            submitted: kycList.filter(k => k.status === kyc_entity_1.KycStatus.SUBMITTED).length,
            approved: kycList.filter(k => k.status === kyc_entity_1.KycStatus.APPROVED).length,
            rejected: kycList.filter(k => k.status === kyc_entity_1.KycStatus.REJECTED).length,
            returned: kycList.filter(k => k.status === kyc_entity_1.KycStatus.RETURNED).length,
            expired: kycList.filter(k => k.status === kyc_entity_1.KycStatus.EXPIRED).length,
        };
        return {
            timeframe,
            total: kycList.length,
            byStatus,
        };
    }
    async getAmlAlertsStatistics(timeframe) {
        const now = new Date();
        let startDate;
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
                createdAt: (0, typeorm_2.Between)(startDate, new Date()),
            },
        });
        const bySeverity = {
            low: alerts.filter(a => a.severity === aml_alert_entity_1.AmlAlertSeverity.LOW).length,
            medium: alerts.filter(a => a.severity === aml_alert_entity_1.AmlAlertSeverity.MEDIUM).length,
            high: alerts.filter(a => a.severity === aml_alert_entity_1.AmlAlertSeverity.HIGH).length,
            critical: alerts.filter(a => a.severity === aml_alert_entity_1.AmlAlertSeverity.CRITICAL).length,
        };
        const byStatus = {
            pending: alerts.filter(a => a.status === aml_alert_entity_1.AmlAlertStatus.PENDING).length,
            acknowledged: alerts.filter(a => a.status === aml_alert_entity_1.AmlAlertStatus.ACKNOWLEDGED).length,
            resolved: alerts.filter(a => a.status === aml_alert_entity_1.AmlAlertStatus.RESOLVED).length,
            escalated: alerts.filter(a => a.status === aml_alert_entity_1.AmlAlertStatus.ESCALATED).length,
        };
        return {
            timeframe,
            total: alerts.length,
            bySeverity,
            byStatus,
        };
    }
    async getSanctionsStatistics(timeframe) {
        const now = new Date();
        let startDate;
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
                createdAt: (0, typeorm_2.Between)(startDate, new Date()),
            },
        });
        const byRiskLevel = {
            low: screenings.filter(s => s.riskLevel === sanction_screening_entity_1.RiskLevel.LOW).length,
            medium: screenings.filter(s => s.riskLevel === sanction_screening_entity_1.RiskLevel.MEDIUM).length,
            high: screenings.filter(s => s.riskLevel === sanction_screening_entity_1.RiskLevel.HIGH).length,
            critical: screenings.filter(s => s.riskLevel === sanction_screening_entity_1.RiskLevel.CRITICAL).length,
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
    async generateDailyReport(date) {
        const reportDate = date || new Date();
        const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));
        const kycSubmitted = await this.kycRepository.count({
            where: {
                submittedAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
        });
        const kycApproved = await this.kycRepository.count({
            where: {
                reviewedAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: kyc_entity_1.KycStatus.APPROVED,
            },
        });
        const kycRejected = await this.kycRepository.count({
            where: {
                reviewedAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: kyc_entity_1.KycStatus.REJECTED,
            },
        });
        const alertsGenerated = await this.amlAlertRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
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
    async generateWeeklyReport() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const kycSubmitted = await this.kycRepository.count({
            where: {
                submittedAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const kycApproved = await this.kycRepository.count({
            where: {
                reviewedAt: (0, typeorm_2.Between)(startDate, endDate),
                status: kyc_entity_1.KycStatus.APPROVED,
            },
        });
        const checksRun = await this.complianceCheckRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const alertsGenerated = await this.amlAlertRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
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
    async generateMonthlyReport() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const kycSubmitted = await this.kycRepository.count({
            where: {
                submittedAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const kycApproved = await this.kycRepository.count({
            where: {
                reviewedAt: (0, typeorm_2.Between)(startDate, endDate),
                status: kyc_entity_1.KycStatus.APPROVED,
            },
        });
        const checksRun = await this.complianceCheckRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const screeningsRun = await this.sanctionScreeningRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const alertsGenerated = await this.amlAlertRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const alertsResolved = await this.amlAlertRepository.count({
            where: {
                resolvedAt: (0, typeorm_2.Between)(startDate, endDate),
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
    async getDashboardSummary() {
        const [pendingKyc, pendingAlerts, totalUsers, totalKyc, recentKyc, recentAlerts] = await Promise.all([
            this.kycRepository.count({ where: { status: kyc_entity_1.KycStatus.SUBMITTED } }),
            this.amlAlertRepository.count({ where: { status: aml_alert_entity_1.AmlAlertStatus.PENDING } }),
            this.userRepository.count(),
            this.kycRepository.count(),
            this.kycRepository.find({
                where: { status: kyc_entity_1.KycStatus.SUBMITTED },
                relations: ['user'],
                order: { submittedAt: 'DESC' },
                take: 5,
            }),
            this.amlAlertRepository.find({
                where: { status: aml_alert_entity_1.AmlAlertStatus.PENDING },
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
    async getRecentActivity(limit = 10) {
        const activities = [];
        const recentKyc = await this.kycRepository.find({
            where: { status: kyc_entity_1.KycStatus.SUBMITTED },
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
        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
    }
    async getPendingItems() {
        const [pendingKyc, pendingAlerts] = await Promise.all([
            this.kycRepository.find({
                where: { status: kyc_entity_1.KycStatus.SUBMITTED },
                relations: ['user'],
                order: { submittedAt: 'ASC' },
            }),
            this.amlAlertRepository.find({
                where: { status: aml_alert_entity_1.AmlAlertStatus.PENDING },
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
    async healthCheck() {
        try {
            await this.kycRepository.count({ take: 1 });
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    database: 'connected',
                },
            };
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kyc_entity_1.Kyc)),
    __param(1, (0, typeorm_1.InjectRepository)(kyc_document_entity_1.KycDocument)),
    __param(2, (0, typeorm_1.InjectRepository)(compliance_check_entity_1.ComplianceCheck)),
    __param(3, (0, typeorm_1.InjectRepository)(sanction_screening_entity_1.SanctionScreening)),
    __param(4, (0, typeorm_1.InjectRepository)(aml_alert_entity_1.AmlAlert)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map