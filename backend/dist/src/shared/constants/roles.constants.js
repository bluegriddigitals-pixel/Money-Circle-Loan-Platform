"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.ROLE_HIERARCHY = exports.ROLES = void 0;
const user_entity_1 = require("../../modules/user/entities/user.entity");
exports.ROLES = {
    ALL: [
        user_entity_1.UserRole.BORROWER,
        user_entity_1.UserRole.LENDER,
        user_entity_1.UserRole.ADMIN,
        user_entity_1.UserRole.AUDITOR,
        user_entity_1.UserRole.TRANSACTION_ADMIN,
        user_entity_1.UserRole.SYSTEM_ADMIN,
        user_entity_1.UserRole.COMPLIANCE_OFFICER,
        user_entity_1.UserRole.RISK_ANALYST,
        user_entity_1.UserRole.CUSTOMER_SUPPORT,
        user_entity_1.UserRole.FINANCIAL_ADVISOR,
        user_entity_1.UserRole.LEGAL_ADVISOR,
        user_entity_1.UserRole.PARTNER,
        user_entity_1.UserRole.AFFILIATE,
    ],
    BORROWER_ROLES: [user_entity_1.UserRole.BORROWER],
    LENDER_ROLES: [user_entity_1.UserRole.LENDER],
    ADMIN_ROLES: [
        user_entity_1.UserRole.ADMIN,
        user_entity_1.UserRole.SYSTEM_ADMIN,
        user_entity_1.UserRole.TRANSACTION_ADMIN,
    ],
    COMPLIANCE_ROLES: [
        user_entity_1.UserRole.COMPLIANCE_OFFICER,
        user_entity_1.UserRole.RISK_ANALYST,
        user_entity_1.UserRole.AUDITOR,
    ],
    SUPPORT_ROLES: [
        user_entity_1.UserRole.CUSTOMER_SUPPORT,
        user_entity_1.UserRole.FINANCIAL_ADVISOR,
        user_entity_1.UserRole.LEGAL_ADVISOR,
    ],
    PARTNER_ROLES: [
        user_entity_1.UserRole.PARTNER,
        user_entity_1.UserRole.AFFILIATE,
    ],
    ALL_ADMIN_ROLES: [
        user_entity_1.UserRole.ADMIN,
        user_entity_1.UserRole.SYSTEM_ADMIN,
        user_entity_1.UserRole.TRANSACTION_ADMIN,
        user_entity_1.UserRole.COMPLIANCE_OFFICER,
        user_entity_1.UserRole.RISK_ANALYST,
        user_entity_1.UserRole.AUDITOR,
    ],
};
exports.ROLE_HIERARCHY = {
    [user_entity_1.UserRole.SYSTEM_ADMIN]: 100,
    [user_entity_1.UserRole.ADMIN]: 90,
    [user_entity_1.UserRole.TRANSACTION_ADMIN]: 80,
    [user_entity_1.UserRole.COMPLIANCE_OFFICER]: 70,
    [user_entity_1.UserRole.AUDITOR]: 60,
    [user_entity_1.UserRole.RISK_ANALYST]: 50,
    [user_entity_1.UserRole.FINANCIAL_ADVISOR]: 40,
    [user_entity_1.UserRole.LEGAL_ADVISOR]: 40,
    [user_entity_1.UserRole.CUSTOMER_SUPPORT]: 30,
    [user_entity_1.UserRole.PARTNER]: 20,
    [user_entity_1.UserRole.AFFILIATE]: 10,
    [user_entity_1.UserRole.LENDER]: 5,
    [user_entity_1.UserRole.BORROWER]: 1,
};
exports.ROLE_PERMISSIONS = {
    [user_entity_1.UserRole.SYSTEM_ADMIN]: [
        'manage_all',
        'manage_users',
        'manage_roles',
        'manage_system',
        'view_audit_logs',
        'manage_compliance',
        'manage_finances',
        'manage_settings',
    ],
    [user_entity_1.UserRole.ADMIN]: [
        'manage_users',
        'view_audit_logs',
        'manage_compliance',
        'manage_finances',
        'view_reports',
    ],
    [user_entity_1.UserRole.TRANSACTION_ADMIN]: [
        'manage_transactions',
        'view_transactions',
        'approve_payouts',
        'manage_fees',
        'view_financial_reports',
    ],
    [user_entity_1.UserRole.COMPLIANCE_OFFICER]: [
        'manage_kyc',
        'view_kyc',
        'manage_aml_alerts',
        'run_compliance_checks',
        'view_compliance_reports',
    ],
    [user_entity_1.UserRole.AUDITOR]: [
        'view_audit_logs',
        'view_transactions',
        'view_compliance',
        'view_financial_reports',
        'export_audit_data',
    ],
    [user_entity_1.UserRole.RISK_ANALYST]: [
        'view_risk_scores',
        'manage_risk_rules',
        'view_risk_reports',
        'flag_suspicious_activity',
    ],
    [user_entity_1.UserRole.FINANCIAL_ADVISOR]: [
        'view_investments',
        'view_loans',
        'provide_advice',
        'view_financial_metrics',
    ],
    [user_entity_1.UserRole.LEGAL_ADVISOR]: [
        'view_legal_docs',
        'manage_legal_compliance',
        'view_disputes',
    ],
    [user_entity_1.UserRole.CUSTOMER_SUPPORT]: [
        'view_users',
        'manage_tickets',
        'view_loans',
        'view_investments',
        'assist_users',
    ],
    [user_entity_1.UserRole.PARTNER]: [
        'view_partner_dashboard',
        'manage_partner_products',
        'view_partner_reports',
    ],
    [user_entity_1.UserRole.AFFILIATE]: [
        'view_affiliate_dashboard',
        'manage_referrals',
        'view_earnings',
    ],
    [user_entity_1.UserRole.LENDER]: [
        'view_investments',
        'make_investments',
        'withdraw_funds',
        'view_earnings',
        'view_marketplace',
    ],
    [user_entity_1.UserRole.BORROWER]: [
        'apply_loans',
        'view_loans',
        'make_payments',
        'view_credit_score',
        'manage_profile',
    ],
};
//# sourceMappingURL=roles.constants.js.map