import apiClient from './client';
import { Transaction } from '../types/transaction';

export interface CreateTransactionData {
  type: string;
  amount: number;
  description?: string;
  loanId?: string;
}

export const transactionsApi = {
  getMyTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> => {
    const response = await apiClient.get('/transactions/my', { params });
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  createDeposit: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await apiClient.post('/transactions/deposit', data);
    return response.data;
  },

  createWithdrawal: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await apiClient.post('/transactions/withdrawal', data);
    return response.data;
  },

  makeRepayment: async (loanId: string, amount: number): Promise<Transaction> => {
    const response = await apiClient.post(`/loans/${loanId}/repay`, { amount });
    return response.data;
  },
};