-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUM TYPES ====================

-- User roles
CREATE TYPE user_role AS ENUM (
    'borrower',
    'lender',
    'auditor',
    'transaction_admin',
    'system_admin'
);

-- Account status
CREATE TYPE account_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'deactivated'
);

-- KYC status
CREATE TYPE kyc_status AS ENUM (
    'not_started',
    'pending',
    'verified',
    'rejected',
    'expired'
);

-- Loan status
CREATE TYPE loan_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'rejected',
    'funding',
    'active',
    'completed',
    'defaulted',
    'written_off'
);

-- Loan application status
CREATE TYPE loan_application_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'expired'
);

-- Transaction type
CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'loan_disbursement',
    'loan_repayment',
    'investment',
    'payout',
    'fee',
    'refund'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'reversed'
);

-- Repayment status
CREATE TYPE repayment_status AS ENUM (
    'pending',
    'due',
    'paid',
    'partial',
    'overdue',
    'defaulted'
);

-- Document type
CREATE TYPE document_type AS ENUM (
    'id_card',
    'passport',
    'drivers_license',
    'proof_of_address',
    'bank_statement',
    'proof_of_income',
    'tax_return',
    'business_registration',
    'other'
);

-- Risk level
CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'very_high'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
    'email',
    'sms',
    'push',
    'in_app'
);

-- ==================== CORE TABLES ====================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    national_id VARCHAR(50) UNIQUE,
    tax_number VARCHAR(50),
    
    -- Role and status
    role user_role NOT NULL DEFAULT 'borrower',
    status account_status NOT NULL DEFAULT 'pending',
    kyc_status kyc_status NOT NULL DEFAULT 'not_started',
    
    -- Contact information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    
    -- Banking details (encrypted)
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_type VARCHAR(50),
    branch_code VARCHAR(20),
    
    -- Security
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deactivated_at TIMESTAMP WITH TIME ZONE
);

-- User profiles (extended information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Employment information
    employment_status VARCHAR(50),
    employer_name VARCHAR(255),
    job_title VARCHAR(100),
    monthly_income DECIMAL(15,2),
    years_employed DECIMAL(5,2),
    
    -- Financial information
    credit_score INTEGER DEFAULT 0,
    total_borrowed DECIMAL(15,2) DEFAULT 0,
    total_repaid DECIMAL(15,2) DEFAULT 0,
    total_invested DECIMAL(15,2) DEFAULT 0,
    total_earned DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) DEFAULT 0,
    
    -- Risk assessment
    risk_level risk_level DEFAULT 'medium',
    risk_score INTEGER DEFAULT 50,
    last_risk_assessment TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    investment_preferences JSONB,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'ZAR',
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan products
CREATE TABLE loan_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Loan terms
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    min_tenure_months INTEGER NOT NULL,
    max_tenure_months INTEGER NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_type VARCHAR(50) DEFAULT 'fixed',
    calculation_method VARCHAR(50) DEFAULT 'flat',
    
    -- Fees
    processing_fee_percent DECIMAL(5,2) DEFAULT 0,
    processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
    late_fee_percent DECIMAL(5,2) DEFAULT 0,
    late_fee_fixed DECIMAL(10,2) DEFAULT 0,
    early_repayment_fee_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Eligibility
    min_credit_score INTEGER DEFAULT 0,
    min_monthly_income DECIMAL(15,2) DEFAULT 0,
    allowed_employment_status TEXT[],
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 65,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Loan applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    loan_product_id UUID REFERENCES loan_products(id),
    
    -- Application details
    amount DECIMAL(15,2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    purpose TEXT,
    
    -- Status and workflow
    status loan_application_status NOT NULL DEFAULT 'draft',
    current_stage VARCHAR(100) DEFAULT 'application',
    assigned_auditor_id UUID REFERENCES users(id),
    
    -- Decision information
    approved_amount DECIMAL(15,2),
    approved_tenure_months INTEGER,
    approved_interest_rate DECIMAL(5,2),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- Risk assessment
    risk_score INTEGER,
    risk_level risk_level,
    risk_notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans (approved applications)
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    loan_application_id UUID UNIQUE REFERENCES loan_applications(id),
    borrower_id UUID NOT NULL REFERENCES users(id),
    loan_product_id UUID NOT NULL REFERENCES loan_products(id),
    
    -- Loan terms
    principal_amount DECIMAL(15,2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_type VARCHAR(50) NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    
    -- Financial details
    total_interest DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    processing_fee DECIMAL(15,2) DEFAULT 0,
    disbursement_fee DECIMAL(15,2) DEFAULT 0,
    insurance_fee DECIMAL(15,2) DEFAULT 0,
    
    -- Current status
    status loan_status NOT NULL DEFAULT 'approved',
    current_balance DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    amount_due DECIMAL(15,2) DEFAULT 0,
    
    -- Dates
    application_date DATE NOT NULL,
    approval_date DATE,
    disbursement_date DATE,
    first_repayment_date DATE,
    last_repayment_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Funding information
    is_fully_funded BOOLEAN DEFAULT FALSE,
    funding_progress DECIMAL(5,2) DEFAULT 0,
    funding_deadline DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan repayment schedule
CREATE TABLE loan_repayment_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    
    -- Amounts
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Dates
    due_date DATE NOT NULL,
    grace_period_days INTEGER DEFAULT 7,
    
    -- Status
    status repayment_status NOT NULL DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_date TIMESTAMP WITH TIME ZONE,
    
    -- Late payment tracking
    late_fee DECIMAL(15,2) DEFAULT 0,
    days_overdue INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(loan_id, installment_number)
);

-- Loan investments (lenders funding loans)
CREATE TABLE loan_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    lender_id UUID NOT NULL REFERENCES users(id),
    
    -- Investment details
    amount DECIMAL(15,2) NOT NULL,
    percentage_owned DECIMAL(5,2) NOT NULL,
    
    -- Returns
    expected_interest DECIMAL(15,2) NOT NULL,
    earned_interest DECIMAL(15,2) DEFAULT 0,
    expected_total_return DECIMAL(15,2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maturity_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(loan_id, lender_id)
);

-- Wallets (user accounts for money management)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balances
    available_balance DECIMAL(15,2) DEFAULT 0,
    locked_balance DECIMAL(15,2) DEFAULT 0,
    
    -- Limits
    withdrawal_limit_daily DECIMAL(15,2) DEFAULT 50000,
    deposit_limit_daily DECIMAL(15,2) DEFAULT 100000,
    
    -- Account details
    wallet_number VARCHAR(50) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    
    -- Transaction details
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    description TEXT,
    
    -- Related entities
    loan_id UUID REFERENCES loans(id),
    repayment_schedule_id UUID REFERENCES loan_repayment_schedule(id),
    investment_id UUID REFERENCES loan_investments(id),
    
    -- Payment gateway information
    gateway_reference VARCHAR(255),
    gateway_name VARCHAR(100),
    gateway_response JSONB,
    
    -- Fees
    processing_fee DECIMAL(15,2) DEFAULT 0,
    gateway_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    
    -- Dates
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User documents (KYC and other documents)
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Document details
    type document_type NOT NULL,
    document_number VARCHAR(100),
    issuing_country VARCHAR(100),
    issuing_authority VARCHAR(255),
    
    -- File storage
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Dates
    issue_date DATE,
    expiry_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs (for compliance and tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID REFERENCES users(id),
    user_ip VARCHAR(45),
    user_agent TEXT,
    
    -- What
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Metadata
    request_id VARCHAR(100),
    status_code INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Notification details
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    
    -- Delivery status
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== RELATIONSHIP TABLES ====================

-- User roles history (for role changes)
CREATE TABLE user_role_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_role user_role,
    new_role user_role NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan guarantors
CREATE TABLE loan_guarantors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Guarantee details
    guarantee_amount DECIMAL(15,2) NOT NULL,
    guarantee_percentage DECIMAL(5,2) NOT NULL,
    relationship_to_borrower VARCHAR(100),
    
    -- Status
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(loan_id, user_id)
);

-- ==================== INDEXES ====================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_role_status ON users(role, status);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_credit_score ON user_profiles(credit_score);

-- Loan products indexes
CREATE INDEX idx_loan_products_code ON loan_products(code);
CREATE INDEX idx_loan_products_active ON loan_products(is_active);

-- Loan applications indexes
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_application_number ON loan_applications(application_number);

-- Loans indexes
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_loan_number ON loans(loan_number);
CREATE INDEX idx_loans_fully_funded ON loans(is_fully_funded);
CREATE INDEX idx_loans_status_dates ON loans(status, disbursement_date, expected_completion_date);

-- Repayment schedule indexes
CREATE INDEX idx_repayment_schedule_loan_id ON loan_repayment_schedule(loan_id);
CREATE INDEX idx_repayment_schedule_due_date ON loan_repayment_schedule(due_date);
CREATE INDEX idx_repayment_schedule_status ON loan_repayment_schedule(status);
CREATE INDEX idx_repayment_due_status ON loan_repayment_schedule(due_date, status);

-- Loan investments indexes
CREATE INDEX idx_loan_investments_loan_id ON loan_investments(loan_id);
CREATE INDEX idx_loan_investments_lender_id ON loan_investments(lender_id);
CREATE INDEX idx_loan_investments_status ON loan_investments(status);

-- Wallets indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_wallet_number ON wallets(wallet_number);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(transaction_reference);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- User documents indexes
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_type ON user_documents(type);
CREATE INDEX idx_user_documents_is_verified ON user_documents(is_verified);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User role history indexes
CREATE INDEX idx_user_role_history_user_id ON user_role_history(user_id);

-- Loan guarantors indexes
CREATE INDEX idx_loan_guarantors_loan_id ON loan_guarantors(loan_id);
CREATE INDEX idx_loan_guarantors_user_id ON loan_guarantors(user_id);

-- ==================== FUNCTIONS AND TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_repayment_schedule_updated_at BEFORE UPDATE ON loan_repayment_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate wallet number
CREATE OR REPLACE FUNCTION generate_wallet_number()
RETURNS TRIGGER AS $$
DECLARE
    wallet_seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(wallet_number FROM 3)::INTEGER), 0) + 1 
    INTO wallet_seq 
    FROM wallets;
    
    NEW.wallet_number := 'WC' || LPAD(wallet_seq::TEXT, 8, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_wallet_number BEFORE INSERT ON wallets
    FOR EACH ROW EXECUTE FUNCTION generate_wallet_number();

-- Function to generate loan application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    app_seq INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(SUBSTRING(application_number FROM 9)::INTEGER), 0) + 1 
    INTO app_seq 
    FROM loan_applications 
    WHERE application_number LIKE 'APP-' || year_month || '-%';
    
    NEW.application_number := 'APP-' || year_month || '-' || LPAD(app_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_application_number BEFORE INSERT ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION generate_application_number();

-- Function to generate loan number
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    loan_seq INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(SUBSTRING(loan_number FROM 9)::INTEGER), 0) + 1 
    INTO loan_seq 
    FROM loans 
    WHERE loan_number LIKE 'LOAN-' || year_month || '-%';
    
    NEW.loan_number := 'LOAN-' || year_month || '-' || LPAD(loan_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_loan_number BEFORE INSERT ON loans
    FOR EACH ROW EXECUTE FUNCTION generate_loan_number();

-- ==================== MIGRATION COMPLETE ====================
