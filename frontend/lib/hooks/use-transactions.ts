import { useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { Transaction } from '../types/transaction';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const data = await transactionsApi.getMyTransactions({ page, limit });
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const createDeposit = async (amount: number, description?: string) => {
    setIsLoading(true);
    try {
      const transaction = await transactionsApi.createDeposit({
        type: 'deposit',
        amount,
        description,
      });
      setTransactions(prev => [transaction, ...prev]);
      return transaction;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create deposit');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createWithdrawal = async (amount: number, description?: string) => {
    setIsLoading(true);
    try {
      const transaction = await transactionsApi.createWithdrawal({
        type: 'withdrawal',
        amount,
        description,
      });
      setTransactions(prev => [transaction, ...prev]);
      return transaction;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create withdrawal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    total,
    isLoading,
    error,
    fetchTransactions,
    createDeposit,
    createWithdrawal,
  };
}