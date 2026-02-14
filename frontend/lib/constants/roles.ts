import { UserRole } from './enums';

// Role-based route access control
export const ROLE_PERMISSIONS = {
  // Borrower permissions
  borrower: {
    canView: [
      '/borrower/*',
      '/profile',
      '/notifications',
    ],
    canEdit: [
      '/borrower/profile',
      '/borrower/apply',
    ],
    canCreate: [
      '/borrower/apply',
    ],
    canDelete: [],
  },

  // Lender permissions
  lender: {
    canView: [
      '/lender/*',
      '/profile',
      '/notifications',
      '/marketplace/*',
    ],
    canEdit: [
      '/lender/profile',
      '/lender/withdrawals',
    ],
    canCreate: [
      '/lender/investments',
      '/lender/withdrawals',
    ],
    canDelete: [],
  },

  // Auditor permissions
  auditor: {
    canView: [
      '/auditor/*',
      '/profile',
      '/notifications',
      '/applications/*',
      '/compliance/*',
    ],
    canEdit: [
      '/auditor/applications/*',
      '/auditor/compliance/*',
    ],
    canCreate: [
      '/auditor/reports',
    ],
    canDelete: [],
  },

  // Transaction Admin permissions
  transaction_admin: {
    canView: [
      '/admin/transaction/*',
      '/profile',
      '/notifications',
      '/transactions/*',
      '/disbursements/*',
      '/withdrawals/*',
    ],
    canEdit: [
      '/admin/transaction/*',
      '/transactions/*',
    ],
    canCreate: [
      '/admin/transaction/disbursements',
      '/admin/transaction/withdrawals',
    ],
    canDelete: [],
  },

  // System Admin permissions
  system_admin: {
    canView: [
      '/admin/system/*',
      '/profile',
      '/notifications',
      '/users/*',
      '/settings/*',
      '/audit-logs/*',
    ],
    canEdit: [
      '/admin/system/*',
      '/users/*',
      '/settings/*',
    ],
    canCreate: [
      '/admin/system/users',
      '/admin/system/roles',
      '/admin/system/products',
    ],
    canDelete: [
      '/admin/system/users',
      '/admin/system/roles',
    ],
  },
} as const;

// Role display names and descriptions
export const ROLE_DETAILS: Record<UserRole, {
  name: string;
  description: string;
  icon: string;
  color: string;
  dashboardRoute: string;
}> = {
  borrower: {
    name: 'Borrower',
    description: 'Apply for loans and manage your borrowing',
    icon: 'UserIcon',
    color: 'blue',
    dashboardRoute: '/borrower/dashboard',
  },
  lender: {
    name: 'Lender',
    description: 'Invest in loans and grow your portfolio',
    icon: 'CashIcon',
    color: 'green',
    dashboardRoute: '/lender/dashboard',
  },
  auditor: {
    name: 'Auditor',
    description: 'Review loan applications and ensure compliance',
    icon: 'ShieldCheckIcon',
    color: 'purple',
    dashboardRoute: '/auditor/dashboard',
  },
  transaction_admin: {
    name: 'Transaction Admin',
    description: 'Manage transactions and disbursements',
    icon: 'CurrencyDollarIcon',
    color: 'orange',
    dashboardRoute: '/admin/transaction/dashboard',
  },
  system_admin: {
    name: 'System Admin',
    description: 'Full system administration and configuration',
    icon: 'CogIcon',
    color: 'red',
    dashboardRoute: '/admin/system/dashboard',
  },
};

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  borrower: 1,
  lender: 1,
  auditor: 2,
  transaction_admin: 3,
  system_admin: 4,
};

// Role-based menu items for sidebar navigation
export const ROLE_MENU_ITEMS: Record<UserRole, Array<{
  name: string;
  href: string;
  icon: string;
  children?: Array<{
    name: string;
    href: string;
    icon?: string;
  }>;
}>> = {
  borrower: [
    {
      name: 'Dashboard',
      href: '/borrower/dashboard',
      icon: 'HomeIcon',
    },
    {
      name: 'Apply for Loan',
      href: '/borrower/apply',
      icon: 'PlusCircleIcon',
    },
    {
      name: 'My Loans',
      href: '/borrower/loans',
      icon: 'DocumentTextIcon',
    },
    {
      name: 'Payments',
      href: '/borrower/payments',
      icon: 'CreditCardIcon',
    },
    {
      name: 'Profile',
      href: '/borrower/profile',
      icon: 'UserIcon',
    },
  ],
  
  lender: [
    {
      name: 'Dashboard',
      href: '/lender/dashboard',
      icon: 'HomeIcon',
    },
    {
      name: 'Marketplace',
      href: '/lender/marketplace',
      icon: 'ShoppingBagIcon',
    },
    {
      name: 'My Portfolio',
      href: '/lender/portfolio',
      icon: 'BriefcaseIcon',
    },
    {
      name: 'Withdrawals',
      href: '/lender/withdrawals',
      icon: 'ArrowDownIcon',
    },
  ],
  
  auditor: [
    {
      name: 'Dashboard',
      href: '/auditor/dashboard',
      icon: 'HomeIcon',
    },
    {
      name: 'Applications',
      href: '/auditor/applications',
      icon: 'ClipboardListIcon',
    },
    {
      name: 'Compliance',
      href: '/auditor/compliance',
      icon: 'ShieldCheckIcon',
    },
  ],
  
  transaction_admin: [
    {
      name: 'Dashboard',
      href: '/admin/transaction/dashboard',
      icon: 'HomeIcon',
    },
    {
      name: 'Disbursements',
      href: '/admin/transaction/disbursements',
      icon: 'ArrowUpIcon',
    },
    {
      name: 'Withdrawals',
      href: '/admin/transaction/withdrawals',
      icon: 'ArrowDownIcon',
    },
  ],
  
  system_admin: [
    {
      name: 'Dashboard',
      href: '/admin/system/dashboard',
      icon: 'HomeIcon',
    },
    {
      name: 'Users',
      href: '/admin/system/users',
      icon: 'UsersIcon',
    },
    {
      name: 'Settings',
      href: '/admin/system/settings',
      icon: 'CogIcon',
      children: [
        {
          name: 'General',
          href: '/admin/system/settings/general',
        },
        {
          name: 'Loan Products',
          href: '/admin/system/settings/loan-products',
        },
        {
          name: 'Fees',
          href: '/admin/system/settings/fees',
        },
        {
          name: 'Limits',
          href: '/admin/system/settings/limits',
        },
      ],
    },
  ],
};

// Default redirects for each role after login
export const ROLE_DEFAULT_REDIRECT: Record<UserRole, string> = {
  borrower: '/borrower/dashboard',
  lender: '/lender/dashboard',
  auditor: '/auditor/dashboard',
  transaction_admin: '/admin/transaction/dashboard',
  system_admin: '/admin/system/dashboard',
};

// Role-based access to features
export const ROLE_FEATURES: Record<UserRole, string[]> = {
  borrower: [
    'view_loans',
    'apply_loans',
    'make_payments',
    'view_profile',
    'upload_documents',
    'view_transactions',
  ],
  lender: [
    'view_marketplace',
    'make_investments',
    'view_portfolio',
    'withdraw_funds',
    'view_transactions',
    'view_returns',
  ],
  auditor: [
    'review_applications',
    'verify_documents',
    'audit_compliance',
    'generate_reports',
    'view_risk_metrics',
  ],
  transaction_admin: [
    'process_disbursements',
    'approve_withdrawals',
    'reconcile_transactions',
    'view_all_transactions',
    'manage_fees',
  ],
  system_admin: [
    'manage_users',
    'manage_roles',
    'manage_settings',
    'view_audit_logs',
    'manage_loan_products',
    'manage_system_config',
    'view_all_data',
  ],
};

// Role-based KYC requirements
export const ROLE_KYC_REQUIREMENTS: Record<UserRole, Array<{
  documentType: string;
  required: boolean;
  description: string;
}>> = {
  borrower: [
    { documentType: 'id_card', required: true, description: 'Valid South African ID' },
    { documentType: 'proof_of_address', required: true, description: 'Recent utility bill or bank statement' },
    { documentType: 'proof_of_income', required: true, description: 'Latest payslip or bank statements' },
    { documentType: 'bank_statement', required: true, description: '3 months bank statements' },
  ],
  lender: [
    { documentType: 'id_card', required: true, description: 'Valid South African ID' },
    { documentType: 'proof_of_address', required: true, description: 'Recent utility bill or bank statement' },
    { documentType: 'proof_of_income', required: true, description: 'Proof of funds for investment' },
  ],
  auditor: [
    { documentType: 'id_card', required: true, description: 'Valid South African ID' },
    { documentType: 'professional_qualification', required: true, description: 'Auditing certification' },
  ],
  transaction_admin: [
    { documentType: 'id_card', required: true, description: 'Valid South African ID' },
    { documentType: 'employment_contract', required: true, description: 'Employment verification' },
  ],
  system_admin: [
    { documentType: 'id_card', required: true, description: 'Valid South African ID' },
    { documentType: 'background_check', required: true, description: 'Security clearance' },
    { documentType: 'employment_contract', required: true, description: 'Employment verification' },
  ],
};

// Function to check if a role has permission for a specific action
export const hasPermission = (
  role: UserRole,
  action: 'canView' | 'canEdit' | 'canCreate' | 'canDelete',
  path: string
): boolean => {
  const permissions = ROLE_PERMISSIONS[role]?.[action] || [];
  
  return permissions.some((pattern: string) => {  // Explicitly type pattern as string
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  });
};

// Function to check if role has access to a feature
export const hasFeature = (role: UserRole, feature: string): boolean => {
  return ROLE_FEATURES[role]?.includes(feature) || false;
};

// Function to check if role is at least a certain level
export const isAtLeastRole = (role: UserRole, minimumRole: UserRole): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
};

// Get all roles that are below a certain role in hierarchy
export const getSubordinateRoles = (role: UserRole): UserRole[] => {
  const roleLevel = ROLE_HIERARCHY[role];
  return (Object.keys(ROLE_HIERARCHY) as UserRole[]).filter(
    (r) => ROLE_HIERARCHY[r] < roleLevel
  );
};

// Get all roles that are above a certain role in hierarchy
export const getSuperiorRoles = (role: UserRole): UserRole[] => {
  const roleLevel = ROLE_HIERARCHY[role];
  return (Object.keys(ROLE_HIERARCHY) as UserRole[]).filter(
    (r) => ROLE_HIERARCHY[r] > roleLevel
  );
};