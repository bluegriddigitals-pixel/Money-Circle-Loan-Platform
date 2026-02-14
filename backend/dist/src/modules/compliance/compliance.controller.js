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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const compliance_service_1 = require("./compliance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ComplianceController = class ComplianceController {
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    async getKycById(id) {
        return this.complianceService.getKycById(id);
    }
    async getKycByUserId(userId) {
        return this.complianceService.getKycByUserId(userId);
    }
    async initiateKyc(userId) {
        return this.complianceService.initiateKyc(userId);
    }
    async submitKyc(id) {
        return this.complianceService.submitKyc(id);
    }
    async approveKyc(id, reviewerId, notes) {
        return this.complianceService.approveKyc(id, reviewerId, notes);
    }
    async rejectKyc(id, reviewerId, reason) {
        return this.complianceService.rejectKyc(id, reviewerId, reason);
    }
    async returnKyc(id, reviewerId, reason) {
        return this.complianceService.returnKyc(id, reviewerId, reason);
    }
    async expireKyc(id) {
        return this.complianceService.expireKyc(id);
    }
    async getAllKyc(page = '1', limit = '10', status, userId, startDate, endDate) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filters = {};
        if (status)
            filters.status = status;
        if (userId)
            filters.userId = userId;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.complianceService.getAllKyc(pageNum, limitNum, filters);
    }
    async getPendingKycCount() {
        const count = await this.complianceService.getPendingKycCount();
        return { count };
    }
    async uploadDocument(kycId, documentData) {
        return this.complianceService.uploadDocument(kycId, documentData);
    }
    async getDocumentById(id) {
        return this.complianceService.getDocumentById(id);
    }
    async getDocumentsByKycId(kycId) {
        return this.complianceService.getDocumentsByKycId(kycId);
    }
    async verifyDocument(id, verifierId) {
        return this.complianceService.verifyDocument(id, verifierId);
    }
    async rejectDocument(id, reason) {
        return this.complianceService.rejectDocument(id, reason);
    }
    async deleteDocument(id) {
        await this.complianceService.deleteDocument(id);
        return { success: true };
    }
    async getComplianceCheckById(id) {
        return this.complianceService.getComplianceCheckById(id);
    }
    async getComplianceChecksByUserId(userId) {
        return this.complianceService.getComplianceChecksByUserId(userId);
    }
    async runComplianceChecks(userId) {
        return this.complianceService.runComplianceChecks(userId);
    }
    async getAllComplianceChecks(page = '1', limit = '10', type, status, result, startDate, endDate) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filters = {};
        if (type)
            filters.checkType = type;
        if (status)
            filters.status = status;
        if (result)
            filters.result = result;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.complianceService.getAllComplianceChecks(pageNum, limitNum, filters);
    }
    async getSanctionScreeningById(id) {
        return this.complianceService.getSanctionScreeningById(id);
    }
    async getSanctionScreeningsByUserId(userId) {
        return this.complianceService.getSanctionScreeningsByUserId(userId);
    }
    async screenUser(userId) {
        return this.complianceService.screenUser(userId);
    }
    async getAllSanctionScreenings(page = '1', limit = '10', riskLevel, matchStatus, startDate, endDate) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filters = {};
        if (riskLevel)
            filters.riskLevel = riskLevel;
        if (matchStatus)
            filters.matchStatus = matchStatus;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.complianceService.getAllSanctionScreenings(pageNum, limitNum, filters);
    }
    async getAmlAlertById(id) {
        return this.complianceService.getAmlAlertById(id);
    }
    async getAmlAlertsByUserId(userId) {
        return this.complianceService.getAmlAlertsByUserId(userId);
    }
    async acknowledgeAlert(id, userId) {
        return this.complianceService.acknowledgeAlert(id, userId);
    }
    async resolveAlert(id, userId, resolution) {
        return this.complianceService.resolveAlert(id, userId, resolution);
    }
    async escalateAlert(id, userId, reason) {
        return this.complianceService.escalateAlert(id, userId, reason);
    }
    async getAllAmlAlerts(page = '1', limit = '10', severity, status, type, startDate, endDate) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filters = {};
        if (severity)
            filters.severity = severity;
        if (status)
            filters.status = status;
        if (type)
            filters.alertType = type;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.complianceService.getAllAmlAlerts(pageNum, limitNum, filters);
    }
    async getPendingAlertsCount() {
        const count = await this.complianceService.getPendingAlertsCount();
        return { count };
    }
    async getUserComplianceStatus(userId) {
        return this.complianceService.getUserComplianceStatus(userId);
    }
    async getUserComplianceSummary(userId) {
        return this.complianceService.getUserComplianceSummary(userId);
    }
    async initializeUserCompliance(userId) {
        return this.complianceService.initializeUserCompliance(userId);
    }
    async refreshUserCompliance(userId) {
        return this.complianceService.refreshUserCompliance(userId);
    }
    async getComplianceStatistics() {
        return this.complianceService.getComplianceStatistics();
    }
    async getKycStatistics(timeframe) {
        return this.complianceService.getKycStatistics(timeframe);
    }
    async getAmlAlertsStatistics(timeframe) {
        return this.complianceService.getAmlAlertsStatistics(timeframe);
    }
    async getSanctionsStatistics(timeframe) {
        return this.complianceService.getSanctionsStatistics(timeframe);
    }
    async generateDailyReport(date) {
        return this.complianceService.generateDailyReport(date ? new Date(date) : undefined);
    }
    async generateWeeklyReport() {
        return this.complianceService.generateWeeklyReport();
    }
    async generateMonthlyReport() {
        return this.complianceService.generateMonthlyReport();
    }
    async getDashboardSummary() {
        return this.complianceService.getDashboardSummary();
    }
    async getRecentActivity(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.complianceService.getRecentActivity(limitNum);
    }
    async getPendingItems() {
        return this.complianceService.getPendingItems();
    }
    async healthCheck() {
        return this.complianceService.healthCheck();
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)('kyc/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getKycById", null);
__decorate([
    (0, common_1.Get)('kyc/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getKycByUserId", null);
__decorate([
    (0, common_1.Post)('kyc/initiate/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "initiateKyc", null);
__decorate([
    (0, common_1.Post)('kyc/:id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.Post)('kyc/:id/approve'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reviewerId')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "approveKyc", null);
__decorate([
    (0, common_1.Post)('kyc/:id/reject'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reviewerId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "rejectKyc", null);
__decorate([
    (0, common_1.Post)('kyc/:id/return'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reviewerId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "returnKyc", null);
__decorate([
    (0, common_1.Post)('kyc/:id/expire'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "expireKyc", null);
__decorate([
    (0, common_1.Get)('kyc'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAllKyc", null);
__decorate([
    (0, common_1.Get)('kyc/stats/pending-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getPendingKycCount", null);
__decorate([
    (0, common_1.Post)('documents/upload/:kycId'),
    __param(0, (0, common_1.Param)('kycId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDocumentById", null);
__decorate([
    (0, common_1.Get)('documents/kyc/:kycId'),
    __param(0, (0, common_1.Param)('kycId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDocumentsByKycId", null);
__decorate([
    (0, common_1.Post)('documents/:id/verify'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('verifierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Post)('documents/:id/reject'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "rejectDocument", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)('checks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceCheckById", null);
__decorate([
    (0, common_1.Get)('checks/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceChecksByUserId", null);
__decorate([
    (0, common_1.Post)('checks/run/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "runComplianceChecks", null);
__decorate([
    (0, common_1.Get)('checks'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('result')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAllComplianceChecks", null);
__decorate([
    (0, common_1.Get)('sanctions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSanctionScreeningById", null);
__decorate([
    (0, common_1.Get)('sanctions/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSanctionScreeningsByUserId", null);
__decorate([
    (0, common_1.Post)('sanctions/screen/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "screenUser", null);
__decorate([
    (0, common_1.Get)('sanctions'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('riskLevel')),
    __param(3, (0, common_1.Query)('matchStatus')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAllSanctionScreenings", null);
__decorate([
    (0, common_1.Get)('alerts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAmlAlertById", null);
__decorate([
    (0, common_1.Get)('alerts/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAmlAlertsByUserId", null);
__decorate([
    (0, common_1.Post)('alerts/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Post)('alerts/:id/resolve'),
    (0, roles_decorator_1.Roles)('admin', 'compliance_officer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('resolution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Post)('alerts/:id/escalate'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "escalateAlert", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAllAmlAlerts", null);
__decorate([
    (0, common_1.Get)('alerts/stats/pending-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getPendingAlertsCount", null);
__decorate([
    (0, common_1.Get)('user/:userId/status'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserComplianceStatus", null);
__decorate([
    (0, common_1.Get)('user/:userId/summary'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserComplianceSummary", null);
__decorate([
    (0, common_1.Post)('user/:userId/initialize'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "initializeUserCompliance", null);
__decorate([
    (0, common_1.Post)('user/:userId/refresh'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "refreshUserCompliance", null);
__decorate([
    (0, common_1.Get)('statistics/compliance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/kyc'),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getKycStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/alerts'),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAmlAlertsStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/sanctions'),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSanctionsStatistics", null);
__decorate([
    (0, common_1.Get)('reports/daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateDailyReport", null);
__decorate([
    (0, common_1.Get)('reports/weekly'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateWeeklyReport", null);
__decorate([
    (0, common_1.Get)('reports/monthly'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateMonthlyReport", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/recent-activity'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('dashboard/pending-items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getPendingItems", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "healthCheck", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('compliance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map