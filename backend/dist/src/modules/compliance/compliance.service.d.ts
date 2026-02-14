import { Repository } from 'typeorm';
import { Kyc } from './entities/kyc.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { SanctionScreening } from './entities/sanction-screening.entity';
import { AmlAlert, AmlAlertStatus, AmlAlertSeverity, AmlAlertType } from './entities/aml-alert.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entities/user.entity';
export declare class ComplianceService {
    private kycRepository;
    private kycDocumentRepository;
    private complianceCheckRepository;
    private sanctionScreeningRepository;
    private amlAlertRepository;
    private userRepository;
    private notificationService;
    private readonly logger;
    constructor(kycRepository: Repository<Kyc>, kycDocumentRepository: Repository<KycDocument>, complianceCheckRepository: Repository<ComplianceCheck>, sanctionScreeningRepository: Repository<SanctionScreening>, amlAlertRepository: Repository<AmlAlert>, userRepository: Repository<User>, notificationService: NotificationService);
    getKycById(id: string): Promise<Kyc>;
    getKycByUserId(userId: string): Promise<Kyc>;
    initiateKyc(userId: string): Promise<Kyc>;
    submitKyc(kycId: string): Promise<Kyc>;
    approveKyc(kycId: string, reviewerId: string, notes?: string): Promise<Kyc>;
    rejectKyc(kycId: string, reviewerId: string, reason: string): Promise<Kyc>;
    returnKyc(kycId: string, reviewerId: string, reason: string): Promise<Kyc>;
    expireKyc(kycId: string): Promise<Kyc>;
    getAllKyc(page?: number, limit?: number, filters?: {
        status?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        items: Kyc[];
        total: number;
    }>;
    getPendingKycCount(): Promise<number>;
    uploadDocument(kycId: string, documentData: Partial<KycDocument>): Promise<KycDocument>;
    getDocumentById(id: string): Promise<KycDocument>;
    getDocumentsByKycId(kycId: string): Promise<KycDocument[]>;
    verifyDocument(id: string, verifierId: string): Promise<KycDocument>;
    rejectDocument(id: string, reason: string): Promise<KycDocument>;
    deleteDocument(id: string): Promise<void>;
    getComplianceCheckById(id: string): Promise<ComplianceCheck>;
    getComplianceChecksByUserId(userId: string): Promise<ComplianceCheck[]>;
    runComplianceChecks(userId: string): Promise<ComplianceCheck[]>;
    getAllComplianceChecks(page?: number, limit?: number, filters?: {
        userId?: string;
        checkType?: string;
        result?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        items: ComplianceCheck[];
        total: number;
    }>;
    getSanctionScreeningById(id: string): Promise<SanctionScreening>;
    getSanctionScreeningsByUserId(userId: string): Promise<SanctionScreening[]>;
    screenUser(userId: string): Promise<SanctionScreening>;
    getAllSanctionScreenings(page?: number, limit?: number, filters?: {
        userId?: string;
        riskLevel?: string;
        matchStatus?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        items: SanctionScreening[];
        total: number;
    }>;
    getAmlAlertById(id: string): Promise<AmlAlert>;
    getAmlAlertsByUserId(userId: string): Promise<AmlAlert[]>;
    acknowledgeAlert(alertId: string, userId: string): Promise<AmlAlert>;
    resolveAlert(alertId: string, userId: string, resolution: string): Promise<AmlAlert>;
    escalateAlert(alertId: string, userId: string, reason: string): Promise<AmlAlert>;
    getAllAmlAlerts(page?: number, limit?: number, filters?: {
        userId?: string;
        status?: AmlAlertStatus;
        severity?: AmlAlertSeverity;
        alertType?: AmlAlertType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        items: AmlAlert[];
        total: number;
    }>;
    getPendingAlertsCount(): Promise<number>;
    getUserComplianceStatus(userId: string): Promise<any>;
    getUserComplianceSummary(userId: string): Promise<any>;
    initializeUserCompliance(userId: string): Promise<any>;
    refreshUserCompliance(userId: string): Promise<any>;
    getComplianceStatistics(): Promise<any>;
    getKycStatistics(timeframe?: string): Promise<any>;
    getAmlAlertsStatistics(timeframe?: string): Promise<any>;
    getSanctionsStatistics(timeframe?: string): Promise<any>;
    generateDailyReport(date?: Date): Promise<any>;
    generateWeeklyReport(): Promise<any>;
    generateMonthlyReport(): Promise<any>;
    getDashboardSummary(): Promise<any>;
    getRecentActivity(limit?: number): Promise<any[]>;
    getPendingItems(): Promise<any>;
    healthCheck(): Promise<any>;
}
