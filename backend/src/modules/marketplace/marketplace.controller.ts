import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { Investment } from './entities/investment.entity';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ============ INVESTMENT ENDPOINTS ============

  @Post('investments')
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiResponse({ status: 201, description: 'Investment created successfully' })
  async createInvestment(@Body() createInvestmentDto: any): Promise<Investment> {
    return this.marketplaceService.createInvestment(createInvestmentDto);
  }

  @Get('investments/:id')
  @ApiOperation({ summary: 'Get investment by ID' })
  @ApiResponse({ status: 200, description: 'Return investment' })
  async getInvestment(@Param('id') id: string): Promise<Investment> {
    return this.marketplaceService.getInvestment(id);
  }

  @Get('investors/:investorId/investments')
  @ApiOperation({ summary: 'Get investments by investor' })
  @ApiResponse({ status: 200, description: 'Return investments' })
  async getInvestmentsByInvestor(@Param('investorId') investorId: string): Promise<Investment[]> {
    return this.marketplaceService.getInvestmentsByInvestor(investorId);
  }

  @Get('loans/:loanId/investments')
  @ApiOperation({ summary: 'Get investments by loan' })
  @ApiResponse({ status: 200, description: 'Return investments' })
  async getInvestmentsByLoan(@Param('loanId') loanId: string): Promise<Investment[]> {
    return this.marketplaceService.getInvestmentsByLoan(loanId);
  }

  @Get('investors/:investorId/active')
  @ApiOperation({ summary: 'Get active investments for investor' })
  @ApiResponse({ status: 200, description: 'Return active investments' })
  async getActiveInvestments(@Param('investorId') investorId: string): Promise<Investment[]> {
    return this.marketplaceService.getActiveInvestments(investorId);
  }

  @Patch('investments/:id/status')
  @ApiOperation({ summary: 'Update investment status' })
  @ApiResponse({ status: 200, description: 'Investment status updated' })
  async updateInvestmentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Investment> {
    return this.marketplaceService.updateInvestmentStatus(id, status as any);
  }

  @Post('investments/:id/returns')
  @ApiOperation({ summary: 'Record return on investment' })
  @ApiResponse({ status: 200, description: 'Return recorded successfully' })
  async recordReturn(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<Investment> {
    return this.marketplaceService.recordReturn(id, amount);
  }

  @Patch('investments/:id/cancel')
  @ApiOperation({ summary: 'Cancel investment' })
  @ApiResponse({ status: 200, description: 'Investment cancelled' })
  async cancelInvestment(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Investment> {
    return this.marketplaceService.cancelInvestment(id, reason);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get investment statistics' })
  @ApiResponse({ status: 200, description: 'Return investment statistics' })
  async getInvestmentStatistics(): Promise<any> {
    return this.marketplaceService.getInvestmentStatistics();
  }

  @Get('investors/:investorId/summary')
  @ApiOperation({ summary: 'Get investor summary' })
  @ApiResponse({ status: 200, description: 'Return investor summary' })
  async getInvestorSummary(@Param('investorId') investorId: string): Promise<any> {
    return this.marketplaceService.getInvestorSummary(investorId);
  }

  // ============ MARKETPLACE ENDPOINTS ============

  @Get('loans/available')
  @ApiOperation({ summary: 'Get available loans for investment' })
  @ApiResponse({ status: 200, description: 'Return available loans' })
  async getAvailableLoans(@Query() filters: any): Promise<any[]> {
    return this.marketplaceService.getAvailableLoansForInvestment(filters);
  }

  @Get('projections')
  @ApiOperation({ summary: 'Calculate investment projection' })
  @ApiResponse({ status: 200, description: 'Return investment projection' })
  async calculateProjection(
    @Query('amount') amount: number,
    @Query('interestRate') interestRate: number,
    @Query('termMonths') termMonths: number,
  ): Promise<any> {
    return this.marketplaceService.calculateInvestmentProjection(amount, interestRate, termMonths);
  }
}