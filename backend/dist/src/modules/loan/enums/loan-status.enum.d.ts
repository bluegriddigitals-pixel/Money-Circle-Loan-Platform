export declare enum LoanStatus {
    DRAFT = "draft",
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    COUNTER_OFFERED = "counter_offered",
    FUNDING = "funding",
    PARTIALLY_FUNDED = "partially_funded",
    FULLY_FUNDED = "fully_funded",
    READY_FOR_DISBURSEMENT = "ready_for_disbursement",
    DISBURSED = "disbursed",
    ACTIVE = "active",
    IN_REPAYMENT = "in_repayment",
    GRACE_PERIOD = "grace_period",
    COMPLETED = "completed",
    PAID_EARLY = "paid_early",
    OVERDUE = "overdue",
    DEFAULTED = "defaulted",
    WRITTEN_OFF = "written_off",
    COLLECTIONS = "collections",
    DISPUTED = "disputed",
    LEGAL_ACTION = "legal_action",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    WITHDRAWN = "withdrawn"
}
export declare enum LoanType {
    PERSONAL = "personal",
    BUSINESS = "business",
    MORTGAGE = "mortgage",
    AUTO = "auto",
    EDUCATION = "education",
    DEBT_CONSOLIDATION = "debt_consolidation",
    HOME_IMPROVEMENT = "home_improvement",
    MEDICAL = "medical",
    EMERGENCY = "emergency",
    PAYDAY = "payday",
    MICRO = "micro",
    PEER_TO_PEER = "peer_to_peer",
    BRIDGE = "bridge",
    EQUIPMENT = "equipment",
    INVOICE = "invoice",
    LINE_OF_CREDIT = "line_of_credit"
}
export declare enum RepaymentFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMI_ANNUALLY = "semi_annually",
    ANNUALLY = "annually",
    BALLOON = "balloon",
    SINGLE_PAYMENT = "single_payment"
}
export declare enum InterestType {
    FIXED = "fixed",
    VARIABLE = "variable",
    COMPOUND = "compound",
    SIMPLE = "simple",
    REDUCING_BALANCE = "reducing_balance",
    FLAT = "flat",
    PRIME_PLUS = "prime_plus",
    TIERED = "tiered"
}
export declare enum LoanPurpose {
    DEBT_CONSOLIDATION = "debt_consolidation",
    HOME_IMPROVEMENT = "home_improvement",
    MAJOR_PURCHASE = "major_purchase",
    MEDICAL_EXPENSES = "medical_expenses",
    EDUCATION = "education",
    BUSINESS_EXPANSION = "business_expansion",
    WORKING_CAPITAL = "working_capital",
    EQUIPMENT_FINANCING = "equipment_financing",
    INVENTORY_PURCHASE = "inventory_purchase",
    MARKETING = "marketing",
    RENOVATION = "renovation",
    VEHICLE_FINANCING = "vehicle_financing",
    WEDDING = "wedding",
    VACATION = "vacation",
    EMERGENCY = "emergency",
    OTHER = "other"
}
export declare enum LoanRiskGrade {
    A_PLUS = "A+",
    A = "A",
    A_MINUS = "A-",
    B_PLUS = "B+",
    B = "B",
    B_MINUS = "B-",
    C_PLUS = "C+",
    C = "C",
    C_MINUS = "C-",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H"
}
export declare enum LoanCollateralType {
    REAL_ESTATE = "real_estate",
    VEHICLE = "vehicle",
    EQUIPMENT = "equipment",
    INVENTORY = "inventory",
    ACCOUNTS_RECEIVABLE = "accounts_receivable",
    CASH = "cash",
    INVESTMENTS = "investments",
    PERSONAL_GUARANTEE = "personal_guarantee",
    CORPORATE_GUARANTEE = "corporate_guarantee",
    CROP = "crop",
    LIVESTOCK = "livestock",
    INTELLECTUAL_PROPERTY = "intellectual_property",
    NONE = "none"
}
export declare enum LoanVerificationStatus {
    PENDING = "pending",
    DOCUMENTS_UPLOADED = "documents_uploaded",
    UNDER_REVIEW = "under_review",
    VERIFIED = "verified",
    REJECTED = "rejected",
    ADDITIONAL_INFO_REQUIRED = "additional_info_required"
}
export declare const LOAN_STATUS_FLOW: {
    draft: LoanStatus[];
    pending: LoanStatus[];
    under_review: LoanStatus[];
    approved: LoanStatus[];
    funding: LoanStatus[];
    partially_funded: LoanStatus[];
    fully_funded: LoanStatus[];
    ready_for_disbursement: LoanStatus[];
    disbursed: LoanStatus[];
    active: LoanStatus[];
    in_repayment: LoanStatus[];
    overdue: LoanStatus[];
    grace_period: LoanStatus[];
    defaulted: LoanStatus[];
    collections: LoanStatus[];
    completed: any[];
    paid_early: any[];
    written_off: any[];
    disputed: LoanStatus[];
    legal_action: LoanStatus[];
    cancelled: any[];
    expired: any[];
    withdrawn: any[];
    rejected: any[];
    counter_offered: LoanStatus[];
};
export declare const LOAN_STATUS_LABELS: Record<LoanStatus, string>;
