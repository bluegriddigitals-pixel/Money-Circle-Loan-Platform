import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment, InvestmentStatus, InvestmentType } from './entities/investment.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
  ) {}

  // ============ INVESTMENT METHODS ============

  async createInvestment(investmentData: Partial<Investment>): Promise<Investment> {
    const investment = this.investmentRepository.create(investmentData);
    return this.investmentRepository.save(investment);
  }

  async getInvestment(id: string): Promise<Investment> {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['investor', 'loan'],
    });

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    return investment;
  }

  async getInvestmentsByInvestor(investorId: string): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { investorId },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getInvestmentsByLoan(loanId: string): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { loanId },
      relations: ['investor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveInvestments(investorId?: string): Promise<Investment[]> {
    const query = this.investmentRepository.createQueryBuilder('investment')
      .where('investment.status = :status', { status: InvestmentStatus.ACTIVE });

    if (investorId) {
      query.andWhere('investment.investorId = :investorId', { investorId });
    }

    query.orderBy('investment.createdAt', 'DESC');

    return query.getMany();
  }

  async updateInvestmentStatus(id: string, status: InvestmentStatus): Promise<Investment> {
    const investment = await this.getInvestment(id);
    investment.status = status;
    return this.investmentRepository.save(investment);
  }

  async recordReturn(investmentId: string, amount: number): Promise<Investment> {
    const investment = await this.getInvestment(investmentId);
    investment.recordReturn(amount);
    return this.investmentRepository.save(investment);
  }

  async cancelInvestment(id: string, reason: string): Promise<Investment> {
    const investment = await this.getInvestment(id);
    investment.cancel(reason);
    return this.investmentRepository.save(investment);
  }

  async getInvestmentStatistics(): Promise<{
    totalInvestments: number;
    totalActive: number;
    totalCompleted: number;
    totalAmount: number;
    totalReturned: number;
    averageRoi: number;
  }> {
    const [
      totalInvestments,
      totalActive,
      totalCompleted,
    ] = await Promise.all([
      this.investmentRepository.count(),
      this.investmentRepository.count({ where: { status: InvestmentStatus.ACTIVE } }),
      this.investmentRepository.count({ where: { status: InvestmentStatus.COMPLETED } }),
    ]);

    const amountResult = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('SUM(investment.amount)', 'total')
      .getRawOne();

    const returnedResult = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('SUM(investment.amountReturned)', 'total')
      .getRawOne();

    const roiResult = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('AVG((investment.amountReturned - investment.amount) / investment.amount * 100)', 'avg')
      .where('investment.status = :status', { status: InvestmentStatus.COMPLETED })
      .getRawOne();

    return {
      totalInvestments,
      totalActive,
      totalCompleted,
      totalAmount: parseFloat(amountResult?.total || '0'),
      totalReturned: parseFloat(returnedResult?.total || '0'),
      averageRoi: parseFloat(roiResult?.avg || '0'),
    };
  }

  async getInvestorSummary(investorId: string): Promise<{
    totalInvested: number;
    totalReturned: number;
    activeInvestments: number;
    completedInvestments: number;
    roi: number;
  }> {
    const investments = await this.getInvestmentsByInvestor(investorId);
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturned = investments.reduce((sum, inv) => sum + inv.amountReturned, 0);
    const activeInvestments = investments.filter(inv => inv.isActive).length;
    const completedInvestments = investments.filter(inv => inv.isCompleted).length;
    
    const roi = totalInvested > 0 ? ((totalReturned - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalReturned,
      activeInvestments,
      completedInvestments,
      roi,
    };
  }

  // ============ MARKETPLACE METHODS ============

  async getAvailableLoansForInvestment(filters?: {
    minAmount?: number;
    maxAmount?: number;
    minInterest?: number;
    maxInterest?: number;
    minTerm?: number;
    maxTerm?: number;
  }): Promise<any[]> {
    // This would query loans that are available for investment
    // For now, return empty array - implement based on your loan entity
    return [];
  }

  async calculateInvestmentProjection(amount: number, interestRate: number, termMonths: number): Promise<{
    totalReturn: number;
    profit: number;
    monthlyReturn: number;
  }> {
    const monthlyRate = interestRate / 100 / 12;
    const totalReturn = amount * Math.pow(1 + monthlyRate, termMonths);
    const profit = totalReturn - amount;
    const monthlyReturn = profit / termMonths;

    return {
      totalReturn,
      profit,
      monthlyReturn,
    };
  }
}