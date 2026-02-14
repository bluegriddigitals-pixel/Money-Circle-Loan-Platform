import { MarketplaceService } from './marketplace.service';
import { Investment } from './entities/investment.entity';
export declare class MarketplaceController {
    private readonly marketplaceService;
    constructor(marketplaceService: MarketplaceService);
    createInvestment(createInvestmentDto: any): Promise<Investment>;
    getInvestment(id: string): Promise<Investment>;
    getInvestmentsByInvestor(investorId: string): Promise<Investment[]>;
    getInvestmentsByLoan(loanId: string): Promise<Investment[]>;
    getActiveInvestments(investorId: string): Promise<Investment[]>;
    updateInvestmentStatus(id: string, status: string): Promise<Investment>;
    recordReturn(id: string, amount: number): Promise<Investment>;
    cancelInvestment(id: string, reason: string): Promise<Investment>;
    getInvestmentStatistics(): Promise<any>;
    getInvestorSummary(investorId: string): Promise<any>;
    getAvailableLoans(filters: any): Promise<any[]>;
    calculateProjection(amount: number, interestRate: number, termMonths: number): Promise<any>;
}
