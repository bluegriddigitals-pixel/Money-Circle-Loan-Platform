import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  // ============ KYC ENDPOINTS ============

  @Get('kyc/:id')
  async getKycById(@Param('id') id: string) {
    return this.complianceService.getKycById(id);
  }

  @Get('kyc/user/:userId')
  async getKycByUserId(@Param('userId') userId: string) {
    return this.complianceService.getKycByUserId(userId);
  }

  @Post('kyc/initiate/:userId')
  async initiateKyc(@Param('userId') userId: string) {
    return this.complianceService.initiateKyc(userId);
  }

  @Post('kyc/:id/submit')
  async submitKyc(@Param('id') id: string) {
    return this.complianceService.submitKyc(id);
  }

  @Post('kyc/:id/approve')
  @Roles('admin', 'compliance_officer')
  async approveKyc(
    @Param('id') id: string,
    @Body('reviewerId') reviewerId: string,
    @Body('notes') notes?: string,
  ) {
    return this.complianceService.approveKyc(id, reviewerId, notes);
  }

  @Post('kyc/:id/reject')
  @Roles('admin', 'compliance_officer')
  async rejectKyc(
    @Param('id') id: string,
    @Body('reviewerId') reviewerId: string,
    @Body('reason') reason: string,
  ) {
    return this.complianceService.rejectKyc(id, reviewerId, reason);
  }

  @Post('kyc/:id/return')
  @Roles('admin', 'compliance_officer')
  async returnKyc(
    @Param('id') id: string,
    @Body('reviewerId') reviewerId: string,
    @Body('reason') reason: string,
  ) {
    return this.complianceService.returnKyc(id, reviewerId, reason);
  }

  @Post('kyc/:id/expire')
  @Roles('admin')
  async expireKyc(@Param('id') id: string) {
    return this.complianceService.expireKyc(id);
  }

  @Get('kyc')
  async getAllKyc(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filters: any = {};
    
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.complianceService.getAllKyc(pageNum, limitNum, filters);
  }

  @Get('kyc/stats/pending-count')
  async getPendingKycCount() {
    const count = await this.complianceService.getPendingKycCount();
    return { count };
  }

  // ============ DOCUMENT ENDPOINTS ============

  @Post('documents/upload/:kycId')
  async uploadDocument(
    @Param('kycId') kycId: string,
    @Body() documentData: any,
  ) {
    return this.complianceService.uploadDocument(kycId, documentData);
  }

  @Get('documents/:id')
  async getDocumentById(@Param('id') id: string) {
    return this.complianceService.getDocumentById(id);
  }

  @Get('documents/kyc/:kycId')
  async getDocumentsByKycId(@Param('kycId') kycId: string) {
    return this.complianceService.getDocumentsByKycId(kycId);
  }

  @Post('documents/:id/verify')
  @Roles('admin', 'compliance_officer')
  async verifyDocument(
    @Param('id') id: string,
    @Body('verifierId') verifierId: string,
  ) {
    return this.complianceService.verifyDocument(id, verifierId);
  }

  @Post('documents/:id/reject')
  @Roles('admin', 'compliance_officer')
  async rejectDocument(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.complianceService.rejectDocument(id, reason);
  }

  @Delete('documents/:id')
  @Roles('admin')
  async deleteDocument(@Param('id') id: string) {
    await this.complianceService.deleteDocument(id);
    return { success: true };
  }

  // ============ COMPLIANCE CHECK ENDPOINTS ============

  @Get('checks/:id')
  async getComplianceCheckById(@Param('id') id: string) {
    return this.complianceService.getComplianceCheckById(id);
  }

  @Get('checks/user/:userId')
  async getComplianceChecksByUserId(@Param('userId') userId: string) {
    return this.complianceService.getComplianceChecksByUserId(userId);
  }

  @Post('checks/run/:userId')
  async runComplianceChecks(@Param('userId') userId: string) {
    return this.complianceService.runComplianceChecks(userId);
  }

  @Get('checks')
  async getAllComplianceChecks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('result') result?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filters: any = {};
    
    if (type) filters.checkType = type;
    if (status) filters.status = status;
    if (result) filters.result = result;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.complianceService.getAllComplianceChecks(pageNum, limitNum, filters);
  }

  // ============ SANCTION SCREENING ENDPOINTS ============

  @Get('sanctions/:id')
  async getSanctionScreeningById(@Param('id') id: string) {
    return this.complianceService.getSanctionScreeningById(id);
  }

  @Get('sanctions/user/:userId')
  async getSanctionScreeningsByUserId(@Param('userId') userId: string) {
    return this.complianceService.getSanctionScreeningsByUserId(userId);
  }

  @Post('sanctions/screen/:userId')
  async screenUser(@Param('userId') userId: string) {
    return this.complianceService.screenUser(userId);
  }

  @Get('sanctions')
  async getAllSanctionScreenings(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('riskLevel') riskLevel?: string,
    @Query('matchStatus') matchStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filters: any = {};
    
    if (riskLevel) filters.riskLevel = riskLevel;
    if (matchStatus) filters.matchStatus = matchStatus;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.complianceService.getAllSanctionScreenings(pageNum, limitNum, filters);
  }

  // ============ AML ALERT ENDPOINTS ============

  @Get('alerts/:id')
  async getAmlAlertById(@Param('id') id: string) {
    return this.complianceService.getAmlAlertById(id);
  }

  @Get('alerts/user/:userId')
  async getAmlAlertsByUserId(@Param('userId') userId: string) {
    return this.complianceService.getAmlAlertsByUserId(userId);
  }

  @Post('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.complianceService.acknowledgeAlert(id, userId);
  }

  @Post('alerts/:id/resolve')
  @Roles('admin', 'compliance_officer')
  async resolveAlert(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('resolution') resolution: string,
  ) {
    return this.complianceService.resolveAlert(id, userId, resolution);
  }

  @Post('alerts/:id/escalate')
  @Roles('admin')
  async escalateAlert(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.complianceService.escalateAlert(id, userId, reason);
  }

  @Get('alerts')
  async getAllAmlAlerts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filters: any = {};
    
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (type) filters.alertType = type;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.complianceService.getAllAmlAlerts(pageNum, limitNum, filters);
  }

  @Get('alerts/stats/pending-count')
  async getPendingAlertsCount() {
    const count = await this.complianceService.getPendingAlertsCount();
    return { count };
  }

  // ============ USER COMPLIANCE ENDPOINTS ============

  @Get('user/:userId/status')
  async getUserComplianceStatus(@Param('userId') userId: string) {
    return this.complianceService.getUserComplianceStatus(userId);
  }

  @Get('user/:userId/summary')
  async getUserComplianceSummary(@Param('userId') userId: string) {
    return this.complianceService.getUserComplianceSummary(userId);
  }

  @Post('user/:userId/initialize')
  async initializeUserCompliance(@Param('userId') userId: string) {
    return this.complianceService.initializeUserCompliance(userId);
  }

  @Post('user/:userId/refresh')
  async refreshUserCompliance(@Param('userId') userId: string) {
    return this.complianceService.refreshUserCompliance(userId);
  }

  // ============ STATISTICS ENDPOINTS ============

  @Get('statistics/compliance')
  async getComplianceStatistics() {
    return this.complianceService.getComplianceStatistics();
  }

  @Get('statistics/kyc')
  async getKycStatistics(@Query('timeframe') timeframe?: string) {
    return this.complianceService.getKycStatistics(timeframe);
  }

  @Get('statistics/alerts')
  async getAmlAlertsStatistics(@Query('timeframe') timeframe?: string) {
    return this.complianceService.getAmlAlertsStatistics(timeframe);
  }

  @Get('statistics/sanctions')
  async getSanctionsStatistics(@Query('timeframe') timeframe?: string) {
    return this.complianceService.getSanctionsStatistics(timeframe);
  }

  // ============ REPORTING ENDPOINTS ============

  @Get('reports/daily')
  async generateDailyReport(@Query('date') date?: string) {
    return this.complianceService.generateDailyReport(date ? new Date(date) : undefined);
  }

  @Get('reports/weekly')
  async generateWeeklyReport() {
    return this.complianceService.generateWeeklyReport();
  }

  @Get('reports/monthly')
  async generateMonthlyReport() {
    return this.complianceService.generateMonthlyReport();
  }

  // ============ DASHBOARD ENDPOINTS ============

  @Get('dashboard/summary')
  async getDashboardSummary() {
    return this.complianceService.getDashboardSummary();
  }

  @Get('dashboard/recent-activity')
  async getRecentActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.complianceService.getRecentActivity(limitNum);
  }

  @Get('dashboard/pending-items')
  async getPendingItems() {
    return this.complianceService.getPendingItems();
  }

  // ============ HEALTH CHECK ============

  @Get('health')
  async healthCheck() {
    return this.complianceService.healthCheck();
  }
}
