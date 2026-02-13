import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('risk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('assessments')
  @Roles(UserRole.ADMIN, UserRole.RISK_ANALYST)
  async createAssessment(@Body() createRiskDto: any) {
    return this.riskService.createAssessment(createRiskDto);
  }

  @Get('assessments')
  @Roles(UserRole.ADMIN, UserRole.RISK_ANALYST)
  async getAllAssessments() {
    return this.riskService.findAll();
  }

  @Get('assessments/:id')
  @Roles(UserRole.ADMIN, UserRole.RISK_ANALYST)
  async getAssessment(@Param('id') id: string) {
    return this.riskService.findOne(id);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.RISK_ANALYST)
  async getUserAssessments(@Param('userId') userId: string) {
    return this.riskService.findByUser(userId);
  }

  @Put('assessments/:id')
  @Roles(UserRole.ADMIN, UserRole.RISK_ANALYST)
  async updateAssessment(@Param('id') id: string, @Body() updateRiskDto: any) {
    return this.riskService.update(id, updateRiskDto);
  }

  @Delete('assessments/:id')
  @Roles(UserRole.ADMIN)
  async deleteAssessment(@Param('id') id: string) {
    return this.riskService.remove(id);
  }
}