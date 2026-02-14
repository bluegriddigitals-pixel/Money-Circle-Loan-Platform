import apiClient from './client';
import { Loan, LoanInvestment } from '../types/loan';

export interface MarketplaceFilters {
  minAmount?: number;
  maxAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  minTenure?: number;
  maxTenure?: number;
  riskLevel?: string;
  sortBy?: 'interest_rate' | 'amount' | 'tenure' | 'funding_progress';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MarketplaceStats {
  totalAvailableLoans: number;
  totalFundingAmount: number;
  averageInterestRate: number;
  averageRiskScore: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  maturedInvestments: number;
  averageReturnRate: number;
}

export const marketplaceApi = {
  // Get all available loans for investment
  getAvailableLoans: async (filters?: MarketplaceFilters): Promise<{
    loans: Loan[];
    total: number;
    page: number;
    totalPages: number;
    stats: MarketplaceStats;
  }> => {
    const response = await apiClient.get('/marketplace/loans', { params: filters });
    return response.data;
  },

  // Get a specific loan details for investment
  getLoanDetails: async (loanId: string): Promise<{
    loan: Loan;
    fundingProgress: number;
    daysLeft?: number;
    similarLoans?: Loan[];
  }> => {
    const response = await apiClient.get(`/marketplace/loans/${loanId}`);
    return response.data;
  },

  // Invest in a loan
  investInLoan: async (loanId: string, amount: number): Promise<{
    investment: LoanInvestment;
    transaction: any;
    remainingAmount: number;
  }> => {
    const response = await apiClient.post(`/marketplace/loans/${loanId}/invest`, { amount });
    return response.data;
  },

  // Get lender's investment portfolio
  getMyInvestments: async (params?: {
    status?: 'active' | 'completed' | 'defaulted';
    page?: number;
    limit?: number;
  }): Promise<{
    investments: LoanInvestment[];
    summary: InvestmentSummary;
    total: number;
  }> => {
    const response = await apiClient.get('/marketplace/my-investments', { params });
    return response.data;
  },

  // Get single investment details
  getInvestmentDetails: async (investmentId: string): Promise<{
    investment: LoanInvestment;
    loan: Loan;
    repaymentSchedule: any[];
    expectedReturns: {
      total: number;
      received: number;
      outstanding: number;
      nextPayment?: {
        amount: number;
        dueDate: string;
      };
    };
  }> => {
    const response = await apiClient.get(`/marketplace/investments/${investmentId}`);
    return response.data;
  },

  // Get investment performance metrics
  getInvestmentPerformance: async (investmentId: string): Promise<{
    roi: number;
    annualizedReturn: number;
    daysHeld: number;
    performanceHistory: Array<{
      date: string;
      value: number;
      earnings: number;
    }>;
  }> => {
    const response = await apiClient.get(`/marketplace/investments/${investmentId}/performance`);
    return response.data;
  },

  // Get marketplace statistics
  getMarketplaceStats: async (): Promise<{
    totalLoans: number;
    totalFundingAmount: number;
    averageInterestRate: number;
    averageLoanAmount: number;
    averageTenure: number;
    riskDistribution: Record<string, number>;
    recentActivity: Array<{
      type: 'investment' | 'listing';
      amount: number;
      user: string;
      timestamp: string;
    }>;
  }> => {
    const response = await apiClient.get('/marketplace/stats');
    return response.data;
  },

  // Get recommended loans for lender (personalized)
  getRecommendedLoans: async (limit?: number): Promise<Loan[]> => {
    const response = await apiClient.get('/marketplace/recommendations', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get trending loans (most invested)
  getTrendingLoans: async (limit?: number): Promise<Loan[]> => {
    const response = await apiClient.get('/marketplace/trending', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get recently funded loans
  getRecentlyFunded: async (limit?: number): Promise<Loan[]> => {
    const response = await apiClient.get('/marketplace/recently-funded', { 
      params: { limit } 
    });
    return response.data;
  },

  // Calculate potential returns
  calculateReturns: async (loanId: string, amount: number): Promise<{
    investment: {
      amount: number;
      percentageOwned: number;
      expectedInterest: number;
      expectedTotalReturn: number;
      monthlyReturn: number;
      annualizedReturn: number;
    };
    schedule: Array<{
      month: number;
      date: string;
      amount: number;
      principal: number;
      interest: number;
    }>;
  }> => {
    const response = await apiClient.post('/marketplace/calculate', { 
      loanId, 
      amount 
    });
    return response.data;
  },

  // Watch/Unwatch a loan (for lenders to track)
  watchLoan: async (loanId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/marketplace/loans/${loanId}/watch`);
    return response.data;
  },

  unwatchLoan: async (loanId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/marketplace/loans/${loanId}/watch`);
    return response.data;
  },

  // Get watched loans
  getWatchedLoans: async (): Promise<Loan[]> => {
    const response = await apiClient.get('/marketplace/watched');
    return response.data;
  },

  // Export investment portfolio (for reports)
  exportPortfolio: async (format: 'csv' | 'pdf'): Promise<Blob> => {
    const response = await apiClient.get('/marketplace/export-portfolio', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get investment insights
  getInvestmentInsights: async (): Promise<{
    diversification: {
      byRisk: Record<string, number>;
      bySector: Record<string, number>;
      byTenure: Record<string, number>;
    };
    performance: {
      monthly: Array<{ month: string; earnings: number }>;
      cumulative: Array<{ date: string; total: number }>;
    };
    recommendations: Array<{
      type: string;
      message: string;
      action?: string;
    }>;
  }> => {
    const response = await apiClient.get('/marketplace/insights');
    return response.data;
  },
};