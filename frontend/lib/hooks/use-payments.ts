import { useState, useEffect, useCallback } from 'react';
import { paymentsApi, PaymentMethod, PaymentSchedule, PaymentReceipt, PaymentStats } from '../api/payments';
import { Transaction } from '../types/transaction';
import { useAuth } from './use-auth';
import toast from 'react-hot-toast';

interface UsePaymentsReturn {
  // State
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  paymentSchedule: PaymentSchedule | null;
  receipts: PaymentReceipt[];
  stats: PaymentStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Payment Methods
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (data: Partial<PaymentMethod>) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  setDefaultPaymentMethod: (id: string) => Promise<boolean>;
  verifyPaymentMethod: (id: string, verificationData: any) => Promise<boolean>;
  
  // Deposits & Withdrawals
  createDeposit: (amount: number, paymentMethodId: string, description?: string) => Promise<any>;
  createWithdrawal: (amount: number, paymentMethodId: string, description?: string) => Promise<any>;
  cancelWithdrawal: (transactionId: string) => Promise<boolean>;
  
  // Repayments
  fetchRepaymentSchedule: (loanId: string) => Promise<void>;
  makeRepayment: (loanId: string, amount: number, paymentMethodId: string, installmentNumber?: number) => Promise<any>;
  calculateEarlySettlement: (loanId: string) => Promise<any>;
  makeEarlySettlement: (loanId: string, paymentMethodId: string) => Promise<any>;
  
  // Receipts & History
  fetchPaymentHistory: (params?: any) => Promise<void>;
  fetchPaymentReceipt: (transactionId: string) => Promise<PaymentReceipt | null>;
  downloadReceipt: (transactionId: string) => Promise<void>;
  downloadStatement: (startDate: string, endDate: string, format?: 'pdf' | 'csv') => Promise<void>;
  
  // Stats & Validation
  fetchPaymentStats: () => Promise<void>;
  validatePaymentMethod: (paymentMethodId: string, amount: number) => Promise<any>;
  
  // Utilities
  clearError: () => void;
  resetState: () => void;
}

export function usePayments(): UsePaymentsReturn {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setPaymentMethods([]);
    setTransactions([]);
    setPaymentSchedule(null);
    setReceipts([]);
    setStats(null);
    setError(null);
  }, []);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const methods = await paymentsApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch payment methods';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Add payment method
  const addPaymentMethod = useCallback(async (data: Partial<PaymentMethod>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMethod = await paymentsApi.addPaymentMethod(data);
      setPaymentMethods(prev => [...prev, newMethod]);
      toast.success('Payment method added successfully');
      return newMethod;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update payment method
  const updatePaymentMethod = useCallback(async (id: string, data: Partial<PaymentMethod>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedMethod = await paymentsApi.updatePaymentMethod(id, data);
      setPaymentMethods(prev => prev.map(m => m.id === id ? updatedMethod : m));
      toast.success('Payment method updated successfully');
      return updatedMethod;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await paymentsApi.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
      toast.success('Payment method deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await paymentsApi.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => prev.map(m => ({
        ...m,
        isDefault: m.id === id
      })));
      toast.success('Default payment method updated');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to set default payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify payment method
  const verifyPaymentMethod = useCallback(async (id: string, verificationData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await paymentsApi.verifyPaymentMethod(id, verificationData);
      await fetchPaymentMethods(); // Refresh methods
      toast.success('Payment method verified successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to verify payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPaymentMethods]);

  // Create deposit
  const createDeposit = useCallback(async (amount: number, paymentMethodId: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.createDeposit({
        amount,
        paymentMethodId,
        description,
      });
      
      toast.success('Deposit initiated successfully');
      
      // Refresh transactions
      await fetchPaymentHistory();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create deposit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create withdrawal
  const createWithdrawal = useCallback(async (amount: number, paymentMethodId: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.createWithdrawal({
        amount,
        paymentMethodId,
        description,
      });
      
      toast.success('Withdrawal initiated successfully');
      
      // Refresh transactions
      await fetchPaymentHistory();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create withdrawal';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel withdrawal
  const cancelWithdrawal = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await paymentsApi.cancelWithdrawal(transactionId);
      toast.success('Withdrawal cancelled successfully');
      
      // Refresh transactions
      await fetchPaymentHistory();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel withdrawal';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch repayment schedule
  const fetchRepaymentSchedule = useCallback(async (loanId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const schedule = await paymentsApi.getRepaymentSchedule(loanId);
      setPaymentSchedule(schedule);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch repayment schedule';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Make repayment
  const makeRepayment = useCallback(async (
    loanId: string,
    amount: number,
    paymentMethodId: string,
    installmentNumber?: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.makeRepayment({
        loanId,
        amount,
        paymentMethodId,
        installmentNumber,
      });
      
      toast.success('Repayment successful');
      
      // Refresh schedule and history
      await fetchRepaymentSchedule(loanId);
      await fetchPaymentHistory();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to make repayment';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRepaymentSchedule]);

  // Calculate early settlement
  const calculateEarlySettlement = useCallback(async (loanId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.calculateEarlySettlement(loanId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to calculate early settlement';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Make early settlement
  const makeEarlySettlement = useCallback(async (loanId: string, paymentMethodId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.makeEarlySettlement(loanId, paymentMethodId);
      toast.success('Loan settled early successfully');
      
      // Refresh history
      await fetchPaymentHistory();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to settle loan early';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async (params?: any) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsApi.getPaymentHistory(params);
      setTransactions(response.transactions);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch payment history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch payment receipt
  const fetchPaymentReceipt = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const receipt = await paymentsApi.getPaymentReceipt(transactionId);
      setReceipts(prev => [...prev, receipt]);
      return receipt;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch receipt';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Download receipt
  const downloadReceipt = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await paymentsApi.downloadReceipt(transactionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to download receipt';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Download statement
  const downloadStatement = useCallback(async (
    startDate: string,
    endDate: string,
    format: 'pdf' | 'csv' = 'pdf'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await paymentsApi.generateStatement({ startDate, endDate, format });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `statement-${startDate}-to-${endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Statement downloaded successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to download statement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch payment stats
  const fetchPaymentStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await paymentsApi.getPaymentStats();
      setStats(stats);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch payment stats';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Validate payment method
  const validatePaymentMethod = useCallback(async (paymentMethodId: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paymentsApi.validatePaymentMethod(paymentMethodId, amount);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to validate payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentMethods();
      fetchPaymentStats();
      fetchPaymentHistory();
    } else {
      resetState();
    }
  }, [isAuthenticated, fetchPaymentMethods, fetchPaymentStats, fetchPaymentHistory, resetState]);

  return {
    // State
    paymentMethods,
    transactions,
    paymentSchedule,
    receipts,
    stats,
    isLoading,
    error,
    
    // Payment Methods
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    verifyPaymentMethod,
    
    // Deposits & Withdrawals
    createDeposit,
    createWithdrawal,
    cancelWithdrawal,
    
    // Repayments
    fetchRepaymentSchedule,
    makeRepayment,
    calculateEarlySettlement,
    makeEarlySettlement,
    
    // Receipts & History
    fetchPaymentHistory,
    fetchPaymentReceipt,
    downloadReceipt,
    downloadStatement,
    
    // Stats & Validation
    fetchPaymentStats,
    validatePaymentMethod,
    
    // Utilities
    clearError,
    resetState,
  };
}