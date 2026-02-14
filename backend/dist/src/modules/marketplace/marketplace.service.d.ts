import { Repository } from 'typeorm';
import { Investment, InvestmentStatus } from './entities/investment.entity';
export declare class MarketplaceService {
    private readonly investmentRepository;
    constructor(investmentRepository: Repository<Investment>);
    createInvestment(investmentData: Partial<Investment>): Promise<Investment>;
    getInvestment(id: string): Promise<Investment>;
    getInvestmentsByInvestor(investorId: string): Promise<Investment[]>;
    getInvestmentsByLoan(loanId: string): Promise<Investment[]>;
    getActiveInvestments(investorId?: string): Promise<Investment[]>;
    updateInvestmentStatus(id: string, status: InvestmentStatus): Promise<Investment>;
    recordReturn(investmentId: string, amount: number): Promise<Investment>;
    cancelInvestment(id: string, reason: string): Promise<Investment>;
    getInvestmentStatistics(): Promise<{
        totalInvestments: number;
        totalActive: number;
        totalCompleted: number;
        totalAmount: number;
        totalReturned: number;
        averageRoi: number;
    }>;
    getInvestorSummary(investorId: string): Promise<{
        totalInvested: number;
        totalReturned: number;
        activeInvestments: number;
        completedInvestments: number;
        roi: number;
    }>;
    getAvailableLoansForInvestment(filters?: {
        minAmount?: number;
        maxAmount?: number;
        minInterest?: number;
        maxInterest?: number;
        minTerm?: number;
        maxTerm?: number;
    }): Promise<any[]>;
    calculateInvestmentProjection(amount: number, interestRate: number, termMonths: number): Promise<{
        totalReturn: number;
        profit: number;
        monthlyReturn: number;
    }>;
}
