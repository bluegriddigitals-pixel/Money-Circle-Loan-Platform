export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Borrower routes
  BORROWER_DASHBOARD: '/borrower/dashboard',
  BORROWER_APPLY: '/borrower/apply',
  BORROWER_LOANS: '/borrower/loans',
  BORROWER_PAYMENTS: '/borrower/payments',
  BORROWER_PROFILE: '/borrower/profile',
  
  // Lender routes
  LENDER_DASHBOARD: '/lender/dashboard',
  LENDER_MARKETPLACE: '/lender/marketplace',
  LENDER_PORTFOLIO: '/lender/portfolio',
  LENDER_WITHDRAWALS: '/lender/withdrawals',
  
  // Auditor routes
  AUDITOR_DASHBOARD: '/auditor/dashboard',
  AUDITOR_APPLICATIONS: '/auditor/applications',
  AUDITOR_COMPLIANCE: '/auditor/compliance',
  
  // Transaction Admin routes
  TRANSACTION_ADMIN_DASHBOARD: '/admin/transaction/dashboard',
  TRANSACTION_ADMIN_DISBURSEMENTS: '/admin/transaction/disbursements',
  TRANSACTION_ADMIN_WITHDRAWALS: '/admin/transaction/withdrawals',
  
  // System Admin routes
  SYSTEM_ADMIN_DASHBOARD: '/admin/system/dashboard',
  SYSTEM_ADMIN_USERS: '/admin/system/users',
  SYSTEM_ADMIN_SETTINGS: '/admin/system/settings',
  
  // Shared routes
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.BORROWER_DASHBOARD,
  ROUTES.BORROWER_APPLY,
  ROUTES.BORROWER_LOANS,
  ROUTES.BORROWER_PAYMENTS,
  ROUTES.BORROWER_PROFILE,
  ROUTES.LENDER_DASHBOARD,
  ROUTES.LENDER_MARKETPLACE,
  ROUTES.LENDER_PORTFOLIO,
  ROUTES.LENDER_WITHDRAWALS,
  ROUTES.AUDITOR_DASHBOARD,
  ROUTES.AUDITOR_APPLICATIONS,
  ROUTES.AUDITOR_COMPLIANCE,
  ROUTES.TRANSACTION_ADMIN_DASHBOARD,
  ROUTES.TRANSACTION_ADMIN_DISBURSEMENTS,
  ROUTES.TRANSACTION_ADMIN_WITHDRAWALS,
  ROUTES.SYSTEM_ADMIN_DASHBOARD,
  ROUTES.SYSTEM_ADMIN_USERS,
  ROUTES.SYSTEM_ADMIN_SETTINGS,
  ROUTES.NOTIFICATIONS,
  ROUTES.PROFILE,
];

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];