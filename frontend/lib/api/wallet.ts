import apiClient from './client';
import { Wallet } from '../types/user';

export const walletApi = {
  getMyWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/wallet/my');
    return response.data;
  },

  getWalletTransactions: async (walletId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await apiClient.get(`/wallet/${walletId}/transactions`, { params });
    return response.data;
  },

  getWalletBalance: async (walletId: string): Promise<{ available: number; locked: number }> => {
    const response = await apiClient.get(`/wallet/${walletId}/balance`);
    return response.data;
  },
};