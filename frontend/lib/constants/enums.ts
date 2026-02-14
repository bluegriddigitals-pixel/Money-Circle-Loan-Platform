// User Roles (matches PostgreSQL user_role enum)
export type UserRole = 
  | 'borrower'
  | 'lender'
  | 'auditor'
  | 'transaction_admin'
  | 'system_admin';

// Account Status (matches PostgreSQL account_status enum)
export type AccountStatus = 
  | 'pending'
  | 'active'
  | 'suspended'
  | 'deactivated';

// KYC Status (matches PostgreSQL kyc_status enum)
export type KYCStatus = 
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'expired';

// Loan Status (matches PostgreSQL loan_status enum)
export type LoanStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'funding'
  | 'active'
  | 'completed'
  | 'defaulted'
  | 'written_off';

// Loan Application Status (matches PostgreSQL loan_application_status enum)
export type LoanApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

// Transaction Type (matches PostgreSQL transaction_type enum)
export type TransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'loan_disbursement'
  | 'loan_repayment'
  | 'investment'
  | 'payout'
  | 'fee'
  | 'refund';

// Transaction Status (matches PostgreSQL transaction_status enum)
export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

// Repayment Status (matches PostgreSQL repayment_status enum)
export type RepaymentStatus = 
  | 'pending'
  | 'due'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'defaulted';

// Document Type (matches PostgreSQL document_type enum)
export type DocumentType = 
  | 'id_card'
  | 'passport'
  | 'drivers_license'
  | 'proof_of_address'
  | 'bank_statement'
  | 'proof_of_income'
  | 'tax_return'
  | 'business_registration'
  | 'other';

// Risk Level (matches PostgreSQL risk_level enum)
export type RiskLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

// Notification Type (matches PostgreSQL notification_type enum)
export type NotificationType = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app';