import apiClient from './client';
import { Transaction } from '../types/transaction';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'bank_account' | 'card' | 'wallet';
  provider: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
  isVerified: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethodId: string;
  description?: string;
  metadata?: {
    provider?: string;
    reference?: string;
  };
}

export interface WithdrawalRequest {
  amount: number;
  paymentMethodId: string;
  description?: string;
  metadata?: {
    swiftCode?: string;
    bankCode?: string;
  };
}

export interface RepaymentRequest {
  loanId: string;
  amount: number;
  installmentNumber?: number;
  paymentMethodId: string;
  earlySettlement?: boolean;
}

export interface EscrowReleaseRequest {
  transactionId: string;
  loanId: string;
  verifiedBy: string;
  releaseAmount: number;
}

export interface PaymentSchedule {
  id: string;
  loanId: string;
  borrowerId: string;
  lenderId: string;
  installments: Array<{
    number: number;
    dueDate: string;
    amount: number;
    principal: number;
    interest: number;
    status: 'pending' | 'paid' | 'overdue' | 'defaulted';
    paidDate?: string;
    paidAmount?: number;
    lateFee?: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  nextDueDate?: string;
  nextAmount?: number;
}

export interface PaymentReceipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  fromAccount: {
    name: string;
    accountNumber: string;
    bank?: string;
  };
  toAccount: {
    name: string;
    accountNumber: string;
    bank?: string;
  };
  description: string;
  reference: string;
  pdfUrl: string;
}

export interface EscrowAccount {
  id: string;
  loanId: string;
  balance: number;
  lockedBalance: number;
  status: 'active' | 'released' | 'disputed';
  createdAt: string;
  updatedAt: string;
  transactions: Array<{
    id: string;
    type: 'deposit' | 'release' | 'refund' | 'hold';
    amount: number;
    balance: number;
    description: string;
    createdAt: string;
  }>;
}

export interface PaymentStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRepayments: number;
  pendingTransactions: number;
  upcomingPayments: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  availableBalance: number;
  lockedBalance: number;
}

export const paymentsApi = {
  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  },

  addPaymentMethod: async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.post('/payments/methods', data);
    return response.data;
  },

  updatePaymentMethod: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.patch(`/payments/methods/${id}`, data);
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/payments/methods/${id}`);
    return response.data;
  },

  setDefaultPaymentMethod: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/payments/methods/${id}/default`);
    return response.data;
  },

  verifyPaymentMethod: async (id: string, verificationData: any): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/payments/methods/${id}/verify`, verificationData);
    return response.data;
  },

  // Deposits
  createDeposit: async (data: DepositRequest): Promise<{
    transaction: Transaction;
    redirectUrl?: string;
    qrCode?: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      branchCode: string;
      reference: string;
    };
  }> => {
    const response = await apiClient.post('/payments/deposits', data);
    return response.data;
  },

  getDepositStatus: async (transactionId: string): Promise<{
    status: string;
    amount: number;
    confirmedAmount?: number;
    confirmations?: number;
    estimatedCompletion?: string;
  }> => {
    const response = await apiClient.get(`/payments/deposits/${transactionId}/status`);
    return response.data;
  },

  // Withdrawals
  createWithdrawal: async (data: WithdrawalRequest): Promise<{
    transaction: Transaction;
    estimatedCompletion: string;
    withdrawalFee: number;
    netAmount: number;
  }> => {
    const response = await apiClient.post('/payments/withdrawals', data);
    return response.data;
  },

  cancelWithdrawal: async (transactionId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/payments/withdrawals/${transactionId}/cancel`);
    return response.data;
  },

  // Loan Repayments
  getRepaymentSchedule: async (loanId: string): Promise<PaymentSchedule> => {
    const response = await apiClient.get(`/payments/loans/${loanId}/schedule`);
    return response.data;
  },

  makeRepayment: async (data: RepaymentRequest): Promise<{
    transaction: Transaction;
    remainingBalance: number;
    nextDueDate?: string;
    nextAmount?: number;
    isFullyPaid: boolean;
  }> => {
    const response = await apiClient.post('/payments/repayments', data);
    return response.data;
  },

  calculateEarlySettlement: async (loanId: string): Promise<{
    originalTotal: number;
    paidAmount: number;
    remainingPrincipal: number;
    remainingInterest: number;
    earlySettlementDiscount: number;
    earlySettlementFee: number;
    totalToPay: number;
    savings: number;
  }> => {
    const response = await apiClient.get(`/payments/loans/${loanId}/early-settlement`);
    return response.data;
  },

  makeEarlySettlement: async (loanId: string, paymentMethodId: string): Promise<{
    transaction: Transaction;
    amountPaid: number;
    savings: number;
    loanClosed: boolean;
  }> => {
    const response = await apiClient.post(`/payments/loans/${loanId}/early-settlement`, {
      paymentMethodId,
    });
    return response.data;
  },

  // Bulk Payments
  makeBulkRepayment: async (payments: Array<{ loanId: string; amount: number; paymentMethodId: string }>): Promise<{
    transactions: Transaction[];
    successful: number;
    failed: number;
    errors?: Array<{ loanId: string; error: string }>;
  }> => {
    const response = await apiClient.post('/payments/repayments/bulk', { payments });
    return response.data;
  },

  // Payment Verification
  verifyPayment: async (transactionId: string, verificationData: any): Promise<{
    verified: boolean;
    transaction: Transaction;
  }> => {
    const response = await apiClient.post(`/payments/${transactionId}/verify`, verificationData);
    return response.data;
  },

  // Escrow Management
  getEscrowAccount: async (loanId: string): Promise<EscrowAccount> => {
    const response = await apiClient.get(`/payments/escrow/${loanId}`);
    return response.data;
  },

  releaseEscrow: async (data: EscrowReleaseRequest): Promise<{
    success: boolean;
    transaction: Transaction;
    remainingBalance: number;
  }> => {
    const response = await apiClient.post('/payments/escrow/release', data);
    return response.data;
  },

  holdEscrow: async (loanId: string, reason: string): Promise<{
    success: boolean;
    escrow: EscrowAccount;
  }> => {
    const response = await apiClient.post(`/payments/escrow/${loanId}/hold`, { reason });
    return response.data;
  },

  // Receipts and Statements
  getPaymentReceipt: async (transactionId: string): Promise<PaymentReceipt> => {
    const response = await apiClient.get(`/payments/receipts/${transactionId}`);
    return response.data;
  },

  downloadReceipt: async (transactionId: string): Promise<Blob> => {
    const response = await apiClient.get(`/payments/receipts/${transactionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateStatement: async (params: {
    startDate: string;
    endDate: string;
    format: 'pdf' | 'csv';
  }): Promise<Blob> => {
    const response = await apiClient.get('/payments/statement', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Payment Statistics
  getPaymentStats: async (): Promise<PaymentStats> => {
    const response = await apiClient.get('/payments/stats');
    return response.data;
  },

  // Payment History
  getPaymentHistory: async (params?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get('/payments/history', { params });
    return response.data;
  },

  // Payment Notifications
  getPaymentNotifications: async (): Promise<Array<{
    id: string;
    type: 'due' | 'overdue' | 'received' | 'failed';
    title: string;
    message: string;
    loanId?: string;
    transactionId?: string;
    amount: number;
    dueDate?: string;
    isRead: boolean;
    createdAt: string;
  }>> => {
    const response = await apiClient.get('/payments/notifications');
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/payments/notifications/${notificationId}/read`);
    return response.data;
  },

  // Payment Validation
  validatePaymentMethod: async (paymentMethodId: string, amount: number): Promise<{
    isValid: boolean;
    errors?: string[];
    fees?: {
      amount: number;
      percentage: number;
      total: number;
    };
    processingTime?: string;
    dailyLimit?: {
      used: number;
      remaining: number;
      total: number;
    };
  }> => {
    const response = await apiClient.post('/payments/validate', {
      paymentMethodId,
      amount,
    });
    return response.data;
  },

  // Webhook Management (for admin)
  getWebhookLogs: async (params?: {
    webhookId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      webhookId: string;
      event: string;
      payload: any;
      response: any;
      statusCode: number;
      success: boolean;
      attempts: number;
      createdAt: string;
    }>;
    total: number;
  }> => {
    const response = await apiClient.get('/payments/webhooks/logs', { params });
    return response.data;
  },

  retryWebhook: async (logId: string): Promise<{ success: boolean; response: any }> => {
    const response = await apiClient.post(`/payments/webhooks/logs/${logId}/retry`);
    return response.data;
  },
};