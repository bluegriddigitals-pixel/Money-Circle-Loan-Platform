import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi, InvestmentSummary } from '../api/marketplace';
import { LoanInvestment } from '../types/loan';
import { useAuth } from './use-auth';
import toast from 'react-hot-toast';

export interface PortfolioMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  totalEarned: number;
  totalExpectedReturns: number;
  averageReturnRate: number;
  activeInvestments: number;
  maturedInvestments: number;
  defaultedInvestments: number;
  diversificationScore: number;
}

export interface InvestmentPerformance {
  investmentId: string;
  loanId: string;
  borrowerName: string;
  amount: number;
  percentageOwned: number;
  expectedInterest: number;
  earnedInterest: number;
  expectedTotalReturn: number;
  currentValue: number;
  roi: number;
  annualizedReturn: number;
  daysHeld: number;
  status: string;
  nextPayment?: {
    amount: number;
    dueDate: string;
  };
  lastPayment?: {
    amount: number;
    date: string;
  };

  
}

export interface PortfolioAllocation {
  byRisk: Array<{
    riskLevel: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  bySector: Array<{
    sector: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  byTenure: Array<{
    tenure: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
}

export interface PortfolioTimeline {
  labels: string[];
  invested: number[];
  earned: number[];
  value: number[];
}

export interface UsePortfolioReturn {
  // State
  investments: LoanInvestment[];
  performance: InvestmentPerformance[];
  summary: InvestmentSummary | null;
  metrics: PortfolioMetrics | null;
  allocation: PortfolioAllocation | null;
  timeline: PortfolioTimeline | null;
  isLoading: boolean;
  error: string | null;
  selectedInvestment: InvestmentPerformance | null;
  
  // Actions
  fetchPortfolio: () => Promise<void>;
  fetchInvestmentDetails: (investmentId: string) => Promise<void>;
  refreshInvestment: (investmentId: string) => Promise<void>;
  exportPortfolio: (format: 'csv' | 'pdf') => Promise<void>;
  calculateProjections: (years: number) => Promise<any>;
  
  // Filtering & Sorting
  filterByStatus: (status: string | string[]) => void;
  filterByRisk: (risk: string | string[]) => void;
  sortBy: (field: string, order: 'asc' | 'desc') => void;
  
  // Selection
  selectInvestment: (investmentId: string | null) => void;
  
  // Utilities
  clearError: () => void;
  resetState: () => void;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user, isAuthenticated } = useAuth();
  const [investments, setInvestments] = useState<LoanInvestment[]>([]);
  const [performance, setPerformance] = useState<InvestmentPerformance[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [allocation, setAllocation] = useState<PortfolioAllocation | null>(null);
  const [timeline, setTimeline] = useState<PortfolioTimeline | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentPerformance | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setInvestments([]);
    setPerformance([]);
    setSummary(null);
    setMetrics(null);
    setAllocation(null);
    setTimeline(null);
    setSelectedInvestment(null);
    setError(null);
  }, []);

  // Select investment
  const selectInvestment = useCallback((investmentId: string | null) => {
    if (!investmentId) {
      setSelectedInvestment(null);
      return;
    }
    
    const investment = performance.find(p => p.investmentId === investmentId);
    setSelectedInvestment(investment || null);
  }, [performance]);

  // Calculate portfolio metrics from investments
  const calculateMetrics = useCallback((investments: LoanInvestment[], perf: InvestmentPerformance[]): PortfolioMetrics => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = perf.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalEarned = perf.reduce((sum, inv) => sum + inv.earnedInterest, 0);
    const totalExpectedReturns = perf.reduce((sum, inv) => sum + inv.expectedTotalReturn, 0);
    
    const activeCount = perf.filter(inv => inv.status === 'active').length;
    const maturedCount = perf.filter(inv => inv.status === 'completed').length;
    const defaultedCount = perf.filter(inv => inv.status === 'defaulted').length;
    
    // Calculate average return rate (weighted by investment amount)
    const weightedReturn = perf.reduce((sum, inv) => {
      return sum + (inv.annualizedReturn * inv.amount);
    }, 0);
    const averageReturnRate = totalInvested > 0 ? weightedReturn / totalInvested : 0;
    
    // Calculate diversification score (0-100)
    const risk = (inv as any).performance?.riskLevel || 'unknown';
    const diversificationScore = Math.min(100, riskLevels * 25); // Simple scoring based on risk diversity
    
    return {
      totalInvested,
      totalCurrentValue,
      totalEarned,
      totalExpectedReturns,
      averageReturnRate,
      activeInvestments: activeCount,
      maturedInvestments: maturedCount,
      defaultedInvestments: defaultedCount,
      diversificationScore,
    };
  }, []);

  // Calculate portfolio allocation
  const calculateAllocation = useCallback((investments: LoanInvestment[], perf: InvestmentPerformance[]): PortfolioAllocation => {
    const total = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Group by risk level
    const riskMap = new Map<string, { amount: number; count: number }>();
    perf.forEach(inv => {
      const risk = inv.performance?.riskLevel || 'unknown';
      const current = riskMap.get(risk) || { amount: 0, count: 0 };
      riskMap.set(risk, {
        amount: current.amount + inv.amount,
        count: current.count + 1,
      });
    });
    
    const byRisk = Array.from(riskMap.entries()).map(([riskLevel, data]) => ({
      riskLevel,
      amount: data.amount,
      percentage: (data.amount / total) * 100,
      count: data.count,
    }));
    
    // Group by status
    const statusMap = new Map<string, { amount: number; count: number }>();
    investments.forEach(inv => {
      const status = inv.status;
      const current = statusMap.get(status) || { amount: 0, count: 0 };
      statusMap.set(status, {
        amount: current.amount + inv.amount,
        count: current.count + 1,
      });
    });
    
    const byStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      amount: data.amount,
      percentage: (data.amount / total) * 100,
      count: data.count,
    }));
    
    // Group by tenure (simplified)
    const byTenure = [
      { tenure: 'Short-term (<12 months)', amount: 0, percentage: 0, count: 0 },
      { tenure: 'Medium-term (12-36 months)', amount: 0, percentage: 0, count: 0 },
      { tenure: 'Long-term (>36 months)', amount: 0, percentage: 0, count: 0 },
    ];
    
    // Group by sector (placeholder - would come from loan data)
    const bySector = [
      { sector: 'Personal', amount: total * 0.4, percentage: 40, count: 2 },
      { sector: 'Business', amount: total * 0.35, percentage: 35, count: 1 },
      { sector: 'Education', amount: total * 0.25, percentage: 25, count: 1 },
    ];
    
    return {
      byRisk,
      bySector,
      byTenure,
      byStatus,
    };
  }, []);

  // Generate timeline data
  const generateTimeline = useCallback((investments: LoanInvestment[], perf: InvestmentPerformance[]): PortfolioTimeline => {
    // Get last 12 months
    const labels: string[] = [];
    const invested: number[] = [];
    const earned: number[] = [];
    const value: number[] = [];
    
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }));
      
      // Simulate cumulative values (would come from actual data)
      invested.push(investments.reduce((sum, inv) => sum + inv.amount, 0) * (0.8 + i * 0.02));
      earned.push(perf.reduce((sum, inv) => sum + inv.earnedInterest, 0) * (i / 12));
      value.push(investments.reduce((sum, inv) => sum + inv.amount, 0) * (0.9 + i * 0.01));
    }
    
    return { labels, invested, earned, value };
  }, []);

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get investments and summary
      const [investmentsResponse, statsResponse] = await Promise.all([
        marketplaceApi.getMyInvestments(),
        marketplaceApi.getMarketplaceStats(),
      ]);
      
      setInvestments(investmentsResponse.investments);
      setSummary(investmentsResponse.summary);
      
      // Fetch performance for each investment
      const performancePromises = investmentsResponse.investments.map(async (inv) => {
        try {
          const details = await marketplaceApi.getInvestmentDetails(inv.id);
          const performance = await marketplaceApi.getInvestmentPerformance(inv.id);
          
          return {
            investmentId: inv.id,
            loanId: inv.loanId,
            borrowerName: 'Borrower Name', // Would come from loan details
            amount: inv.amount,
            percentageOwned: inv.percentageOwned,
            expectedInterest: inv.expectedInterest,
            earnedInterest: inv.earnedInterest,
            expectedTotalReturn: inv.expectedTotalReturn,
            currentValue: inv.amount + inv.earnedInterest,
            roi: (inv.earnedInterest / inv.amount) * 100,
            annualizedReturn: performance.annualizedReturn,
            daysHeld: performance.daysHeld,
            status: inv.status,
            nextPayment: details.expectedReturns?.nextPayment,
            lastPayment: {
              amount: 0, // Would come from transaction history
              date: new Date().toISOString(),
            },
            performance: performance,
          } as InvestmentPerformance;
        } catch (err) {
          console.error(`Failed to fetch performance for investment ${inv.id}`, err);
          return null;
        }
      });
      
      const performanceResults = await Promise.all(performancePromises);
      const validPerformance = performanceResults.filter((p): p is InvestmentPerformance => p !== null);
      setPerformance(validPerformance);
      
      // Calculate metrics and allocation
      const metricsData = calculateMetrics(investmentsResponse.investments, validPerformance);
      setMetrics(metricsData);
      
      const allocationData = calculateAllocation(investmentsResponse.investments, validPerformance);
      setAllocation(allocationData);
      
      const timelineData = generateTimeline(investmentsResponse.investments, validPerformance);
      setTimeline(timelineData);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch portfolio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, calculateMetrics, calculateAllocation, generateTimeline]);

  // Fetch single investment details
  const fetchInvestmentDetails = useCallback(async (investmentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await marketplaceApi.getInvestmentDetails(investmentId);
      const performance = await marketplaceApi.getInvestmentPerformance(investmentId);
      
      const investmentPerf: InvestmentPerformance = {
        investmentId,
        loanId: details.loan.id,
        borrowerName: 'Borrower Name', // Would come from loan details
        amount: details.investment.amount,
        percentageOwned: details.investment.percentageOwned,
        expectedInterest: details.investment.expectedInterest,
        earnedInterest: details.investment.earnedInterest,
        expectedTotalReturn: details.investment.expectedTotalReturn,
        currentValue: details.investment.amount + details.investment.earnedInterest,
        roi: (details.investment.earnedInterest / details.investment.amount) * 100,
        annualizedReturn: performance.annualizedReturn,
        daysHeld: performance.daysHeld,
        status: details.investment.status,
        nextPayment: details.expectedReturns?.nextPayment,
        lastPayment: {
          amount: 0, // Would come from transaction history
          date: new Date().toISOString(),
        },
        performance,
      };
      
      // Update performance list
      setPerformance(prev => {
        const index = prev.findIndex(p => p.investmentId === investmentId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = investmentPerf;
          return updated;
        }
        return [...prev, investmentPerf];
      });
      
      // Update metrics
      if (metrics) {
        const updatedMetrics = calculateMetrics(investments, performance);
        setMetrics(updatedMetrics);
      }
      
      setSelectedInvestment(investmentPerf);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch investment details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [investments, metrics, calculateMetrics]);

  // Refresh single investment
  const refreshInvestment = useCallback(async (investmentId: string) => {
    await fetchInvestmentDetails(investmentId);
  }, [fetchInvestmentDetails]);

  // Export portfolio
  const exportPortfolio = useCallback(async (format: 'csv' | 'pdf') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await marketplaceApi.exportPortfolio(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Portfolio exported successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to export portfolio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate projections
  const calculateProjections = useCallback(async (years: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would call an API endpoint for sophisticated projections
      const projections = {
        years,
        currentValue: metrics?.totalCurrentValue || 0,
        projectedValues: Array.from({ length: years }, (_, i) => ({
          year: i + 1,
          conservative: (metrics?.totalCurrentValue || 0) * Math.pow(1 + 0.05, i + 1),
          moderate: (metrics?.totalCurrentValue || 0) * Math.pow(1 + 0.08, i + 1),
          aggressive: (metrics?.totalCurrentValue || 0) * Math.pow(1 + 0.12, i + 1),
        })),
        expectedEarnings: (metrics?.totalExpectedReturns || 0) * years,
      };
      
      return projections;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to calculate projections';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [metrics]);

  // Filter by status
  const filterByStatus = useCallback((status: string | string[]) => {
    // Implementation would filter the displayed investments
    // This is a placeholder - actual filtering would be done in UI
    console.log('Filter by status:', status);
  }, []);

  // Filter by risk
  const filterByRisk = useCallback((risk: string | string[]) => {
    // Implementation would filter the displayed investments
    console.log('Filter by risk:', risk);
  }, []);

  // Sort investments
  const sortBy = useCallback((field: string, order: 'asc' | 'desc') => {
    setPerformance(prev => {
      const sorted = [...prev].sort((a, b) => {
        let aVal = a[field as keyof InvestmentPerformance];
        let bVal = b[field as keyof InvestmentPerformance];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
      return sorted;
    });
  }, []);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'lender') {
      fetchPortfolio();
    } else {
      resetState();
    }
  }, [isAuthenticated, user?.role, fetchPortfolio, resetState]);

  return {
    // State
    investments,
    performance,
    summary,
    metrics,
    allocation,
    timeline,
    isLoading,
    error,
    selectedInvestment,
    
    // Actions
    fetchPortfolio,
    fetchInvestmentDetails,
    refreshInvestment,
    exportPortfolio,
    calculateProjections,
    
    // Filtering & Sorting
    filterByStatus,
    filterByRisk,
    sortBy,
    
    // Selection
    selectInvestment,
    
    // Utilities
    clearError,
    resetState,
  };
}