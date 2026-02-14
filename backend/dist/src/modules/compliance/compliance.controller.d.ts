import { ComplianceService } from './compliance.service';
export declare class ComplianceController {
    private readonly complianceService;
    constructor(complianceService: ComplianceService);
    getKycById(id: string): Promise<import("./entities/kyc.entity").Kyc>;
    getKycByUserId(userId: string): Promise<import("./entities/kyc.entity").Kyc>;
    initiateKyc(userId: string): Promise<import("./entities/kyc.entity").Kyc>;
    submitKyc(id: string): Promise<import("./entities/kyc.entity").Kyc>;
    approveKyc(id: string, reviewerId: string, notes?: string): Promise<import("./entities/kyc.entity").Kyc>;
    rejectKyc(id: string, reviewerId: string, reason: string): Promise<import("./entities/kyc.entity").Kyc>;
    returnKyc(id: string, reviewerId: string, reason: string): Promise<import("./entities/kyc.entity").Kyc>;
    expireKyc(id: string): Promise<import("./entities/kyc.entity").Kyc>;
    getAllKyc(page?: string, limit?: string, status?: string, userId?: string, startDate?: string, endDate?: string): Promise<{
        items: import("./entities/kyc.entity").Kyc[];
        total: number;
    }>;
    getPendingKycCount(): Promise<{
        count: number;
    }>;
    uploadDocument(kycId: string, documentData: any): Promise<import("./entities/kyc-document.entity").KycDocument>;
    getDocumentById(id: string): Promise<import("./entities/kyc-document.entity").KycDocument>;
    getDocumentsByKycId(kycId: string): Promise<import("./entities/kyc-document.entity").KycDocument[]>;
    verifyDocument(id: string, verifierId: string): Promise<import("./entities/kyc-document.entity").KycDocument>;
    rejectDocument(id: string, reason: string): Promise<import("./entities/kyc-document.entity").KycDocument>;
    deleteDocument(id: string): Promise<{
        success: boolean;
    }>;
    getComplianceCheckById(id: string): Promise<import("./entities/compliance-check.entity").ComplianceCheck>;
    getComplianceChecksByUserId(userId: string): Promise<import("./entities/compliance-check.entity").ComplianceCheck[]>;
    runComplianceChecks(userId: string): Promise<import("./entities/compliance-check.entity").ComplianceCheck[]>;
    getAllComplianceChecks(page?: string, limit?: string, type?: string, status?: string, result?: string, startDate?: string, endDate?: string): Promise<{
        items: import("./entities/compliance-check.entity").ComplianceCheck[];
        total: number;
    }>;
    getSanctionScreeningById(id: string): Promise<import("./entities/sanction-screening.entity").SanctionScreening>;
    getSanctionScreeningsByUserId(userId: string): Promise<import("./entities/sanction-screening.entity").SanctionScreening[]>;
    screenUser(userId: string): Promise<import("./entities/sanction-screening.entity").SanctionScreening>;
    getAllSanctionScreenings(page?: string, limit?: string, riskLevel?: string, matchStatus?: string, startDate?: string, endDate?: string): Promise<{
        items: import("./entities/sanction-screening.entity").SanctionScreening[];
        total: number;
    }>;
    getAmlAlertById(id: string): Promise<import("./entities/aml-alert.entity").AmlAlert>;
    getAmlAlertsByUserId(userId: string): Promise<import("./entities/aml-alert.entity").AmlAlert[]>;
    acknowledgeAlert(id: string, userId: string): Promise<import("./entities/aml-alert.entity").AmlAlert>;
    resolveAlert(id: string, userId: string, resolution: string): Promise<import("./entities/aml-alert.entity").AmlAlert>;
    escalateAlert(id: string, userId: string, reason: string): Promise<import("./entities/aml-alert.entity").AmlAlert>;
    getAllAmlAlerts(page?: string, limit?: string, severity?: string, status?: string, type?: string, startDate?: string, endDate?: string): Promise<{
        items: import("./entities/aml-alert.entity").AmlAlert[];
        total: number;
    }>;
    getPendingAlertsCount(): Promise<{
        count: number;
    }>;
    getUserComplianceStatus(userId: string): Promise<any>;
    getUserComplianceSummary(userId: string): Promise<any>;
    initializeUserCompliance(userId: string): Promise<any>;
    refreshUserCompliance(userId: string): Promise<any>;
    getComplianceStatistics(): Promise<any>;
    getKycStatistics(timeframe?: string): Promise<any>;
    getAmlAlertsStatistics(timeframe?: string): Promise<any>;
    getSanctionsStatistics(timeframe?: string): Promise<any>;
    generateDailyReport(date?: string): Promise<any>;
    generateWeeklyReport(): Promise<any>;
    generateMonthlyReport(): Promise<any>;
    getDashboardSummary(): Promise<any>;
    getRecentActivity(limit?: string): Promise<any[]>;
    getPendingItems(): Promise<any>;
    healthCheck(): Promise<any>;
}
