import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
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
import { ComplianceService } from './compliance.service';
import { Kyc } from './entities/kyc.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { SanctionScreening } from './entities/sanction-screening.entity';
import { AmlAlert } from './entities/aml-alert.entity';

@ApiTags('compliance')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  // ============ KYC ENDPOINTS ============

  @Get('kyc/:id')
  @ApiOperation({ summary: 'Get KYC by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return KYC record' })
  @ApiParam({ name: 'id', type: 'string' })
  async getKycById(@Param('id', ParseUUIDPipe) id: string): Promise<Kyc> {
    return this.complianceService.getKycById(id);
  }

  @Get('kyc/user/:userId')
  @ApiOperation({ summary: 'Get KYC by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return KYC record' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getKycByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Kyc> {
    return this.complianceService.getKycByUserId(userId);
  }

  @Post('kyc/:userId/initiate')
  @ApiOperation({ summary: 'Initiate KYC process' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'KYC process initiated' })
  @ApiParam({ name: 'userId', type: 'string' })
  async initiateKyc(@Param('userId', ParseUUIDPipe) userId: string): Promise<Kyc> {
    return this.complianceService.initiateKyc(userId);
  }

  @Post('kyc/:kycId/submit')
  @ApiOperation({ summary: 'Submit KYC for review' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KYC submitted for review' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async submitKyc(@Param('kycId', ParseUUIDPipe) kycId: string): Promise<Kyc> {
    return this.complianceService.submitKyc(kycId);
  }

  @Patch('kyc/:kycId/approve')
  @ApiOperation({ summary: 'Approve KYC' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KYC approved' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async approveKyc(
    @Param('kycId', ParseUUIDPipe) kycId: string,
    @Body('approvedBy') approvedBy: string,
    @Body('notes') notes?: string,
  ): Promise<Kyc> {
    return this.complianceService.approveKyc(kycId, approvedBy, notes);
  }

  @Patch('kyc/:kycId/reject')
  @ApiOperation({ summary: 'Reject KYC' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KYC rejected' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async rejectKyc(
    @Param('kycId', ParseUUIDPipe) kycId: string,
    @Body('rejectedBy') rejectedBy: string,
    @Body('reason') reason: string,
  ): Promise<Kyc> {
    return this.complianceService.rejectKyc(kycId, rejectedBy, reason);
  }

  @Patch('kyc/:kycId/return')
  @ApiOperation({ summary: 'Return KYC for revisions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KYC returned for revisions' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async returnKyc(
    @Param('kycId', ParseUUIDPipe) kycId: string,
    @Body('returnedBy') returnedBy: string,
    @Body('reason') reason: string,
  ): Promise<Kyc> {
    return this.complianceService.returnKyc(kycId, returnedBy, reason);
  }

  @Patch('kyc/:kycId/expire')
  @ApiOperation({ summary: 'Expire KYC' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KYC expired' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async expireKyc(@Param('kycId', ParseUUIDPipe) kycId: string): Promise<Kyc> {
    return this.complianceService.expireKyc(kycId);
  }

  @Get('kyc')
  @ApiOperation({ summary: 'Get all KYC records with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return KYC records' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAllKyc(
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: Kyc[]; total: number }> {
    return this.complianceService.getAllKyc({
      status,
      level,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('kyc/pending/count')
  @ApiOperation({ summary: 'Get pending KYC count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return pending KYC count' })
  async getPendingKycCount(): Promise<{ count: number }> {
    const count = await this.complianceService.getPendingKycCount();
    return { count };
  }

  // ============ KYC DOCUMENTS ENDPOINTS ============

  @Post('kyc/:kycId/documents')
  @ApiOperation({ summary: 'Upload KYC document' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Document uploaded' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async uploadDocument(
    @Param('kycId', ParseUUIDPipe) kycId: string,
    @Body() documentData: any,
  ): Promise<KycDocument> {
    return this.complianceService.uploadDocument(kycId, documentData);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return document' })
  @ApiParam({ name: 'id', type: 'string' })
  async getDocumentById(@Param('id', ParseUUIDPipe) id: string): Promise<KycDocument> {
    return this.complianceService.getDocumentById(id);
  }

  @Get('kyc/:kycId/documents')
  @ApiOperation({ summary: 'Get documents by KYC ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return documents' })
  @ApiParam({ name: 'kycId', type: 'string' })
  async getDocumentsByKycId(
    @Param('kycId', ParseUUIDPipe) kycId: string,
  ): Promise<KycDocument[]> {
    return this.complianceService.getDocumentsByKycId(kycId);
  }

  @Patch('documents/:id/verify')
  @ApiOperation({ summary: 'Verify document' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document verified' })
  @ApiParam({ name: 'id', type: 'string' })
  async verifyDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('verifiedBy') verifiedBy: string,
    @Body('notes') notes?: string,
  ): Promise<KycDocument> {
    return this.complianceService.verifyDocument(id, verifiedBy, notes);
  }

  @Patch('documents/:id/reject')
  @ApiOperation({ summary: 'Reject document' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document rejected' })
  @ApiParam({ name: 'id', type: 'string' })
  async rejectDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('rejectedBy') rejectedBy: string,
    @Body('reason') reason: string,
  ): Promise<KycDocument> {
    return this.complianceService.rejectDocument(id, rejectedBy, reason);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Document deleted' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteDocument(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.complianceService.deleteDocument(id);
  }

  // ============ COMPLIANCE CHECKS ENDPOINTS ============

  @Get('checks/:id')
  @ApiOperation({ summary: 'Get compliance check by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return compliance check' })
  @ApiParam({ name: 'id', type: 'string' })
  async getComplianceCheckById(@Param('id', ParseUUIDPipe) id: string): Promise<ComplianceCheck> {
    return this.complianceService.getComplianceCheckById(id);
  }

  @Get('checks/user/:userId')
  @ApiOperation({ summary: 'Get compliance checks by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return compliance checks' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getComplianceChecksByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ComplianceCheck[]> {
    return this.complianceService.getComplianceChecksByUserId(userId);
  }

  @Post('checks/:userId/run')
  @ApiOperation({ summary: 'Run compliance checks for user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Compliance checks completed' })
  @ApiParam({ name: 'userId', type: 'string' })
  async runComplianceChecks(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ComplianceCheck[]> {
    return this.complianceService.runComplianceChecks(userId);
  }

  @Get('checks')
  @ApiOperation({ summary: 'Get all compliance checks with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return compliance checks' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'result', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAllComplianceChecks(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('result') result?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: ComplianceCheck[]; total: number }> {
    return this.complianceService.getAllComplianceChecks({
      type,
      status,
      result,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  // ============ SANCTION SCREENING ENDPOINTS ============

  @Get('sanctions/:id')
  @ApiOperation({ summary: 'Get sanction screening by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return sanction screening' })
  @ApiParam({ name: 'id', type: 'string' })
  async getSanctionScreeningById(@Param('id', ParseUUIDPipe) id: string): Promise<SanctionScreening> {
    return this.complianceService.getSanctionScreeningById(id);
  }

  @Get('sanctions/user/:userId')
  @ApiOperation({ summary: 'Get sanction screenings by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return sanction screenings' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getSanctionScreeningsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SanctionScreening[]> {
    return this.complianceService.getSanctionScreeningsByUserId(userId);
  }

  @Post('sanctions/:userId/screen')
  @ApiOperation({ summary: 'Screen user against sanctions lists' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Screening completed' })
  @ApiParam({ name: 'userId', type: 'string' })
  async screenUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SanctionScreening> {
    return this.complianceService.screenUser(userId);
  }

  @Get('sanctions')
  @ApiOperation({ summary: 'Get all sanction screenings with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return sanction screenings' })
  @ApiQuery({ name: 'list', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'match', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAllSanctionScreenings(
    @Query('list') list?: string,
    @Query('status') status?: string,
    @Query('match') match?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: SanctionScreening[]; total: number }> {
    return this.complianceService.getAllSanctionScreenings({
      list,
      status,
      match,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  // ============ AML ALERTS ENDPOINTS ============

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Get AML alert by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return AML alert' })
  @ApiParam({ name: 'id', type: 'string' })
  async getAmlAlertById(@Param('id', ParseUUIDPipe) id: string): Promise<AmlAlert> {
    return this.complianceService.getAmlAlertById(id);
  }

  @Get('alerts/user/:userId')
  @ApiOperation({ summary: 'Get AML alerts by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return AML alerts' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getAmlAlertsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<AmlAlert[]> {
    return this.complianceService.getAmlAlertsByUserId(userId);
  }

  @Patch('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge AML alert' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alert acknowledged' })
  @ApiParam({ name: 'id', type: 'string' })
  async acknowledgeAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('acknowledgedBy') acknowledgedBy: string,
  ): Promise<AmlAlert> {
    return this.complianceService.acknowledgeAlert(id, acknowledgedBy);
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve AML alert' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alert resolved' })
  @ApiParam({ name: 'id', type: 'string' })
  async resolveAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('resolvedBy') resolvedBy: string,
    @Body('resolution') resolution: string,
    @Body('notes') notes?: string,
  ): Promise<AmlAlert> {
    return this.complianceService.resolveAlert(id, resolvedBy, resolution, notes);
  }

  @Patch('alerts/:id/escalate')
  @ApiOperation({ summary: 'Escalate AML alert' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alert escalated' })
  @ApiParam({ name: 'id', type: 'string' })
  async escalateAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('escalatedBy') escalatedBy: string,
    @Body('reason') reason: string,
    @Body('assignedTo') assignedTo?: string,
  ): Promise<AmlAlert> {
    return this.complianceService.escalateAlert(id, escalatedBy, reason, assignedTo);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get all AML alerts with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return AML alerts' })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAllAmlAlerts(
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ items: AmlAlert[]; total: number }> {
    return this.complianceService.getAllAmlAlerts({
      severity,
      status,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('alerts/pending/count')
  @ApiOperation({ summary: 'Get pending AML alerts count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return pending alerts count' })
  async getPendingAlertsCount(): Promise<{ count: number }> {
    const count = await this.complianceService.getPendingAlertsCount();
    return { count };
  }

  // ============ USER COMPLIANCE ENDPOINTS ============

  @Get('user/:userId/status')
  @ApiOperation({ summary: 'Get user compliance status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return user compliance status' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getUserComplianceStatus(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<{
    kycStatus: string;
    amlStatus: string;
    sanctionsStatus: string;
    pepStatus: string;
    overallStatus: string;
    lastUpdated: Date;
  }> {
    return this.complianceService.getUserComplianceStatus(userId);
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get user compliance summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return user compliance summary' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getUserComplianceSummary(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<any> {
    return this.complianceService.getUserComplianceSummary(userId);
  }

  @Post('user/:userId/initialize')
  @ApiOperation({ summary: 'Initialize compliance for user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Compliance initialized' })
  @ApiParam({ name: 'userId', type: 'string' })
  async initializeUserCompliance(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return this.complianceService.initializeUserCompliance(userId);
  }

  @Post('user/:userId/refresh')
  @ApiOperation({ summary: 'Refresh all compliance checks for user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compliance checks refreshed' })
  @ApiParam({ name: 'userId', type: 'string' })
  async refreshUserCompliance(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return this.complianceService.refreshUserCompliance(userId);
  }

  // ============ REPORTING & STATISTICS ENDPOINTS ============

  @Get('statistics/summary')
  @ApiOperation({ summary: 'Get compliance statistics summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return compliance statistics' })
  async getComplianceStatistics(): Promise<any> {
    return this.complianceService.getComplianceStatistics();
  }

  @Get('statistics/kyc')
  @ApiOperation({ summary: 'Get KYC statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return KYC statistics' })
  async getKycStatistics(): Promise<any> {
    return this.complianceService.getKycStatistics();
  }

  @Get('statistics/alerts')
  @ApiOperation({ summary: 'Get AML alerts statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return AML alerts statistics' })
  async getAmlAlertsStatistics(): Promise<any> {
    return this.complianceService.getAmlAlertsStatistics();
  }

  @Get('statistics/sanctions')
  @ApiOperation({ summary: 'Get sanctions screening statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return sanctions screening statistics' })
  async getSanctionsStatistics(): Promise<any> {
    return this.complianceService.getSanctionsStatistics();
  }

  @Get('reports/daily')
  @ApiOperation({ summary: 'Generate daily compliance report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return daily compliance report' })
  async generateDailyReport(): Promise<any> {
    return this.complianceService.generateDailyReport();
  }

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Generate weekly compliance report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return weekly compliance report' })
  async generateWeeklyReport(): Promise<any> {
    return this.complianceService.generateWeeklyReport();
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Generate monthly compliance report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return monthly compliance report' })
  async generateMonthlyReport(): Promise<any> {
    return this.complianceService.generateMonthlyReport();
  }

  // ============ DASHBOARD ENDPOINTS ============

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get compliance dashboard summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return dashboard summary' })
  async getDashboardSummary(): Promise<any> {
    return this.complianceService.getDashboardSummary();
  }

  @Get('dashboard/recent-activity')
  @ApiOperation({ summary: 'Get recent compliance activity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<any[]> {
    return this.complianceService.getRecentActivity(limit);
  }

  @Get('dashboard/pending-items')
  @ApiOperation({ summary: 'Get pending compliance items count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return pending items count' })
  async getPendingItems(): Promise<{
    pendingKyc: number;
    pendingDocuments: number;
    pendingAlerts: number;
    pendingReviews: number;
  }> {
    return this.complianceService.getPendingItems();
  }

  // ============ HEALTH CHECK ============

  @Get('health')
  @ApiOperation({ summary: 'Check compliance service health' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compliance service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    return this.complianceService.healthCheck();
  }
}