import apiClient from './client';
import { 
  Loan, 
  LoanApplication, 
  LoanProduct, 
  LoanRepaymentSchedule,
  LoanInvestment 
} from '../types/loan';

export const loansApi = {
  // Loan Products
  getLoanProducts: async (): Promise<LoanProduct[]> => {
    const response = await apiClient.get('/loans/products');
    return response.data;
  },

  getLoanProduct: async (id: string): Promise<LoanProduct> => {
    const response = await apiClient.get(`/loans/products/${id}`);
    return response.data;
  },

  // Loan Applications
  createApplication: async (data: Partial<LoanApplication>): Promise<LoanApplication> => {
    const response = await apiClient.post('/loans/applications', data);
    return response.data;
  },

  getMyApplications: async (): Promise<LoanApplication[]> => {
    const response = await apiClient.get('/loans/applications/my');
    return response.data;
  },

  getApplication: async (id: string): Promise<LoanApplication> => {
    const response = await apiClient.get(`/loans/applications/${id}`);
    return response.data;
  },

  updateApplication: async (id: string, data: Partial<LoanApplication>): Promise<LoanApplication> => {
    const response = await apiClient.patch(`/loans/applications/${id}`, data);
    return response.data;
  },

  submitApplication: async (id: string): Promise<LoanApplication> => {
    const response = await apiClient.post(`/loans/applications/${id}/submit`);
    return response.data;
  },

  // Loans
  getMyLoans: async (): Promise<Loan[]> => {
    const response = await apiClient.get('/loans/my');
    return response.data;
  },

  getLoan: async (id: string): Promise<Loan> => {
    const response = await apiClient.get(`/loans/${id}`);
    return response.data;
  },

  getLoanRepaymentSchedule: async (loanId: string): Promise<LoanRepaymentSchedule[]> => {
    const response = await apiClient.get(`/loans/${loanId}/repayment-schedule`);
    return response.data;
  },

  // Loan Investments (for lenders)
  getAvailableLoans: async (): Promise<Loan[]> => {
    const response = await apiClient.get('/loans/available');
    return response.data;
  },

  investInLoan: async (loanId: string, amount: number): Promise<LoanInvestment> => {
    const response = await apiClient.post(`/loans/${loanId}/invest`, { amount });
    return response.data;
  },

  getMyInvestments: async (): Promise<LoanInvestment[]> => {
    const response = await apiClient.get('/loans/investments/my');
    return response.data;
  },
};