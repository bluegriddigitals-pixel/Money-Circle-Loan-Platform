export enum LoanStatus {
  // Initial states
  DRAFT = 'draft',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',

  // Approval states
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COUNTER_OFFERED = 'counter_offered',

  // Funding states
  FUNDING = 'funding',
  PARTIALLY_FUNDED = 'partially_funded',
  FULLY_FUNDED = 'fully_funded',

  // Disbursement states
  READY_FOR_DISBURSEMENT = 'ready_for_disbursement',
  DISBURSED = 'disbursed',

  // Repayment states
  ACTIVE = 'active',
  IN_REPAYMENT = 'in_repayment',
  GRACE_PERIOD = 'grace_period',

  // Completion states
  COMPLETED = 'completed',
  PAID_EARLY = 'paid_early',

  // Problem states
  OVERDUE = 'overdue',
  DEFAULTED = 'defaulted',
  WRITTEN_OFF = 'written_off',
  COLLECTIONS = 'collections',

  // Legal states
  DISPUTED = 'disputed',
  LEGAL_ACTION = 'legal_action',

  // Cancellation states
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn',
}

export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  AUTO = 'auto',
  EDUCATION = 'education',
  DEBT_CONSOLIDATION = 'debt_consolidation',
  HOME_IMPROVEMENT = 'home_improvement',
  MEDICAL = 'medical',
  EMERGENCY = 'emergency',
  PAYDAY = 'payday',
  MICRO = 'micro',
  PEER_TO_PEER = 'peer_to_peer',
  BRIDGE = 'bridge',
  EQUIPMENT = 'equipment',
  INVOICE = 'invoice',
  LINE_OF_CREDIT = 'line_of_credit',
}

export enum RepaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  BALLOON = 'balloon',
  SINGLE_PAYMENT = 'single_payment',
}

export enum InterestType {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  COMPOUND = 'compound',
  SIMPLE = 'simple',
  REDUCING_BALANCE = 'reducing_balance',
  FLAT = 'flat',
  PRIME_PLUS = 'prime_plus',
  TIERED = 'tiered',
}

export enum LoanPurpose {
  DEBT_CONSOLIDATION = 'debt_consolidation',
  HOME_IMPROVEMENT = 'home_improvement',
  MAJOR_PURCHASE = 'major_purchase',
  MEDICAL_EXPENSES = 'medical_expenses',
  EDUCATION = 'education',
  BUSINESS_EXPANSION = 'business_expansion',
  WORKING_CAPITAL = 'working_capital',
  EQUIPMENT_FINANCING = 'equipment_financing',
  INVENTORY_PURCHASE = 'inventory_purchase',
  MARKETING = 'marketing',
  RENOVATION = 'renovation',
  VEHICLE_FINANCING = 'vehicle_financing',
  WEDDING = 'wedding',
  VACATION = 'vacation',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export enum LoanRiskGrade {
  A_PLUS = 'A+',
  A = 'A',
  A_MINUS = 'A-',
  B_PLUS = 'B+',
  B = 'B',
  B_MINUS = 'B-',
  C_PLUS = 'C+',
  C = 'C',
  C_MINUS = 'C-',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
}

export enum LoanCollateralType {
  REAL_ESTATE = 'real_estate',
  VEHICLE = 'vehicle',
  EQUIPMENT = 'equipment',
  INVENTORY = 'inventory',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  CASH = 'cash',
  INVESTMENTS = 'investments',
  PERSONAL_GUARANTEE = 'personal_guarantee',
  CORPORATE_GUARANTEE = 'corporate_guarantee',
  CROP = 'crop',
  LIVESTOCK = 'livestock',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  NONE = 'none',
}

export enum LoanVerificationStatus {
  PENDING = 'pending',
  DOCUMENTS_UPLOADED = 'documents_uploaded',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  ADDITIONAL_INFO_REQUIRED = 'additional_info_required',
}

export const LOAN_STATUS_FLOW = {
  [LoanStatus.DRAFT]: [LoanStatus.PENDING, LoanStatus.CANCELLED],
  [LoanStatus.PENDING]: [LoanStatus.UNDER_REVIEW, LoanStatus.REJECTED, LoanStatus.CANCELLED],
  [LoanStatus.UNDER_REVIEW]: [LoanStatus.APPROVED, LoanStatus.REJECTED, LoanStatus.COUNTER_OFFERED],
  [LoanStatus.APPROVED]: [LoanStatus.FUNDING, LoanStatus.REJECTED, LoanStatus.CANCELLED],
  [LoanStatus.FUNDING]: [LoanStatus.PARTIALLY_FUNDED, LoanStatus.FULLY_FUNDED, LoanStatus.CANCELLED],
  [LoanStatus.PARTIALLY_FUNDED]: [LoanStatus.FULLY_FUNDED, LoanStatus.CANCELLED],
  [LoanStatus.FULLY_FUNDED]: [LoanStatus.READY_FOR_DISBURSEMENT],
  [LoanStatus.READY_FOR_DISBURSEMENT]: [LoanStatus.DISBURSED],
  [LoanStatus.DISBURSED]: [LoanStatus.ACTIVE],
  [LoanStatus.ACTIVE]: [LoanStatus.IN_REPAYMENT, LoanStatus.OVERDUE],
  [LoanStatus.IN_REPAYMENT]: [LoanStatus.COMPLETED, LoanStatus.OVERDUE, LoanStatus.PAID_EARLY],
  [LoanStatus.OVERDUE]: [LoanStatus.DEFAULTED, LoanStatus.GRACE_PERIOD],
  [LoanStatus.GRACE_PERIOD]: [LoanStatus.IN_REPAYMENT, LoanStatus.DEFAULTED],
  [LoanStatus.DEFAULTED]: [LoanStatus.COLLECTIONS, LoanStatus.WRITTEN_OFF, LoanStatus.LEGAL_ACTION],
  [LoanStatus.COLLECTIONS]: [LoanStatus.WRITTEN_OFF, LoanStatus.LEGAL_ACTION],
  [LoanStatus.COMPLETED]: [],
  [LoanStatus.PAID_EARLY]: [],
  [LoanStatus.WRITTEN_OFF]: [],
  [LoanStatus.DISPUTED]: [LoanStatus.LEGAL_ACTION, LoanStatus.ACTIVE],
  [LoanStatus.LEGAL_ACTION]: [LoanStatus.WRITTEN_OFF],
  [LoanStatus.CANCELLED]: [],
  [LoanStatus.EXPIRED]: [],
  [LoanStatus.WITHDRAWN]: [],
  [LoanStatus.REJECTED]: [],
  [LoanStatus.COUNTER_OFFERED]: [LoanStatus.PENDING, LoanStatus.REJECTED],
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  [LoanStatus.DRAFT]: 'Draft',
  [LoanStatus.PENDING]: 'Pending Review',
  [LoanStatus.UNDER_REVIEW]: 'Under Review',
  [LoanStatus.APPROVED]: 'Approved',
  [LoanStatus.REJECTED]: 'Rejected',
  [LoanStatus.COUNTER_OFFERED]: 'Counter Offered',
  [LoanStatus.FUNDING]: 'Funding',
  [LoanStatus.PARTIALLY_FUNDED]: 'Partially Funded',
  [LoanStatus.FULLY_FUNDED]: 'Fully Funded',
  [LoanStatus.READY_FOR_DISBURSEMENT]: 'Ready for Disbursement',
  [LoanStatus.DISBURSED]: 'Disbursed',
  [LoanStatus.ACTIVE]: 'Active',
  [LoanStatus.IN_REPAYMENT]: 'In Repayment',
  [LoanStatus.GRACE_PERIOD]: 'Grace Period',
  [LoanStatus.COMPLETED]: 'Completed',
  [LoanStatus.PAID_EARLY]: 'Paid Early',
  [LoanStatus.OVERDUE]: 'Overdue',
  [LoanStatus.DEFAULTED]: 'Defaulted',
  [LoanStatus.WRITTEN_OFF]: 'Written Off',
  [LoanStatus.COLLECTIONS]: 'In Collections',
  [LoanStatus.DISPUTED]: 'Disputed',
  [LoanStatus.LEGAL_ACTION]: 'Legal Action',
  [LoanStatus.CANCELLED]: 'Cancelled',
  [LoanStatus.EXPIRED]: 'Expired',
  [LoanStatus.WITHDRAWN]: 'Withdrawn',
};