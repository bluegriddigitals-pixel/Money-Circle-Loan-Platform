import { UserRole } from '../../modules/user/entities/user.entity';

export const ROLES = {
  ALL: [
    UserRole.BORROWER,
    UserRole.LENDER,
    UserRole.ADMIN,
    UserRole.AUDITOR,
    UserRole.TRANSACTION_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.RISK_ANALYST,
    UserRole.CUSTOMER_SUPPORT,
    UserRole.FINANCIAL_ADVISOR,
    UserRole.LEGAL_ADVISOR,
    UserRole.PARTNER,
    UserRole.AFFILIATE,
  ] as const,

  BORROWER_ROLES: [UserRole.BORROWER] as const,
  LENDER_ROLES: [UserRole.LENDER] as const,
  ADMIN_ROLES: [
    UserRole.ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.TRANSACTION_ADMIN,
  ] as const,
  
  COMPLIANCE_ROLES: [
    UserRole.COMPLIANCE_OFFICER,
    UserRole.RISK_ANALYST,
    UserRole.AUDITOR,
  ] as const,

  SUPPORT_ROLES: [
    UserRole.CUSTOMER_SUPPORT,
    UserRole.FINANCIAL_ADVISOR,
    UserRole.LEGAL_ADVISOR,
  ] as const,

  PARTNER_ROLES: [
    UserRole.PARTNER,
    UserRole.AFFILIATE,
  ] as const,

  ALL_ADMIN_ROLES: [
    UserRole.ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.TRANSACTION_ADMIN,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.RISK_ANALYST,
    UserRole.AUDITOR,
  ] as const,
};

export const ROLE_HIERARCHY = {
  [UserRole.SYSTEM_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.TRANSACTION_ADMIN]: 80,
  [UserRole.COMPLIANCE_OFFICER]: 70,
  [UserRole.AUDITOR]: 60,
  [UserRole.RISK_ANALYST]: 50,
  [UserRole.FINANCIAL_ADVISOR]: 40,
  [UserRole.LEGAL_ADVISOR]: 40,
  [UserRole.CUSTOMER_SUPPORT]: 30,
  [UserRole.PARTNER]: 20,
  [UserRole.AFFILIATE]: 10,
  [UserRole.LENDER]: 5,
  [UserRole.BORROWER]: 1,
} as const;

export const ROLE_PERMISSIONS = {
  [UserRole.SYSTEM_ADMIN]: [
    'manage_all',
    'manage_users',
    'manage_roles',
    'manage_system',
    'view_audit_logs',
    'manage_compliance',
    'manage_finances',
    'manage_settings',
  ],
  [UserRole.ADMIN]: [
    'manage_users',
    'view_audit_logs',
    'manage_compliance',
    'manage_finances',
    'view_reports',
  ],
  [UserRole.TRANSACTION_ADMIN]: [
    'manage_transactions',
    'view_transactions',
    'approve_payouts',
    'manage_fees',
    'view_financial_reports',
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    'manage_kyc',
    'view_kyc',
    'manage_aml_alerts',
    'run_compliance_checks',
    'view_compliance_reports',
  ],
  [UserRole.AUDITOR]: [
    'view_audit_logs',
    'view_transactions',
    'view_compliance',
    'view_financial_reports',
    'export_audit_data',
  ],
  [UserRole.RISK_ANALYST]: [
    'view_risk_scores',
    'manage_risk_rules',
    'view_risk_reports',
    'flag_suspicious_activity',
  ],
  [UserRole.FINANCIAL_ADVISOR]: [
    'view_investments',
    'view_loans',
    'provide_advice',
    'view_financial_metrics',
  ],
  [UserRole.LEGAL_ADVISOR]: [
    'view_legal_docs',
    'manage_legal_compliance',
    'view_disputes',
  ],
  [UserRole.CUSTOMER_SUPPORT]: [
    'view_users',
    'manage_tickets',
    'view_loans',
    'view_investments',
    'assist_users',
  ],
  [UserRole.PARTNER]: [
    'view_partner_dashboard',
    'manage_partner_products',
    'view_partner_reports',
  ],
  [UserRole.AFFILIATE]: [
    'view_affiliate_dashboard',
    'manage_referrals',
    'view_earnings',
  ],
  [UserRole.LENDER]: [
    'view_investments',
    'make_investments',
    'withdraw_funds',
    'view_earnings',
    'view_marketplace',
  ],
  [UserRole.BORROWER]: [
    'apply_loans',
    'view_loans',
    'make_payments',
    'view_credit_score',
    'manage_profile',
  ],
} as const;

export type RoleType = keyof typeof ROLE_HIERARCHY;
export type PermissionType = typeof ROLE_PERMISSIONS[RoleType][number];