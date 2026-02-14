"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAN_STATUS_LABELS = exports.LOAN_STATUS_FLOW = exports.LoanVerificationStatus = exports.LoanCollateralType = exports.LoanRiskGrade = exports.LoanPurpose = exports.InterestType = exports.RepaymentFrequency = exports.LoanType = exports.LoanStatus = void 0;
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["DRAFT"] = "draft";
    LoanStatus["PENDING"] = "pending";
    LoanStatus["UNDER_REVIEW"] = "under_review";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["COUNTER_OFFERED"] = "counter_offered";
    LoanStatus["FUNDING"] = "funding";
    LoanStatus["PARTIALLY_FUNDED"] = "partially_funded";
    LoanStatus["FULLY_FUNDED"] = "fully_funded";
    LoanStatus["READY_FOR_DISBURSEMENT"] = "ready_for_disbursement";
    LoanStatus["DISBURSED"] = "disbursed";
    LoanStatus["ACTIVE"] = "active";
    LoanStatus["IN_REPAYMENT"] = "in_repayment";
    LoanStatus["GRACE_PERIOD"] = "grace_period";
    LoanStatus["COMPLETED"] = "completed";
    LoanStatus["PAID_EARLY"] = "paid_early";
    LoanStatus["OVERDUE"] = "overdue";
    LoanStatus["DEFAULTED"] = "defaulted";
    LoanStatus["WRITTEN_OFF"] = "written_off";
    LoanStatus["COLLECTIONS"] = "collections";
    LoanStatus["DISPUTED"] = "disputed";
    LoanStatus["LEGAL_ACTION"] = "legal_action";
    LoanStatus["CANCELLED"] = "cancelled";
    LoanStatus["EXPIRED"] = "expired";
    LoanStatus["WITHDRAWN"] = "withdrawn";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var LoanType;
(function (LoanType) {
    LoanType["PERSONAL"] = "personal";
    LoanType["BUSINESS"] = "business";
    LoanType["MORTGAGE"] = "mortgage";
    LoanType["AUTO"] = "auto";
    LoanType["EDUCATION"] = "education";
    LoanType["DEBT_CONSOLIDATION"] = "debt_consolidation";
    LoanType["HOME_IMPROVEMENT"] = "home_improvement";
    LoanType["MEDICAL"] = "medical";
    LoanType["EMERGENCY"] = "emergency";
    LoanType["PAYDAY"] = "payday";
    LoanType["MICRO"] = "micro";
    LoanType["PEER_TO_PEER"] = "peer_to_peer";
    LoanType["BRIDGE"] = "bridge";
    LoanType["EQUIPMENT"] = "equipment";
    LoanType["INVOICE"] = "invoice";
    LoanType["LINE_OF_CREDIT"] = "line_of_credit";
})(LoanType || (exports.LoanType = LoanType = {}));
var RepaymentFrequency;
(function (RepaymentFrequency) {
    RepaymentFrequency["DAILY"] = "daily";
    RepaymentFrequency["WEEKLY"] = "weekly";
    RepaymentFrequency["BI_WEEKLY"] = "bi_weekly";
    RepaymentFrequency["MONTHLY"] = "monthly";
    RepaymentFrequency["QUARTERLY"] = "quarterly";
    RepaymentFrequency["SEMI_ANNUALLY"] = "semi_annually";
    RepaymentFrequency["ANNUALLY"] = "annually";
    RepaymentFrequency["BALLOON"] = "balloon";
    RepaymentFrequency["SINGLE_PAYMENT"] = "single_payment";
})(RepaymentFrequency || (exports.RepaymentFrequency = RepaymentFrequency = {}));
var InterestType;
(function (InterestType) {
    InterestType["FIXED"] = "fixed";
    InterestType["VARIABLE"] = "variable";
    InterestType["COMPOUND"] = "compound";
    InterestType["SIMPLE"] = "simple";
    InterestType["REDUCING_BALANCE"] = "reducing_balance";
    InterestType["FLAT"] = "flat";
    InterestType["PRIME_PLUS"] = "prime_plus";
    InterestType["TIERED"] = "tiered";
})(InterestType || (exports.InterestType = InterestType = {}));
var LoanPurpose;
(function (LoanPurpose) {
    LoanPurpose["DEBT_CONSOLIDATION"] = "debt_consolidation";
    LoanPurpose["HOME_IMPROVEMENT"] = "home_improvement";
    LoanPurpose["MAJOR_PURCHASE"] = "major_purchase";
    LoanPurpose["MEDICAL_EXPENSES"] = "medical_expenses";
    LoanPurpose["EDUCATION"] = "education";
    LoanPurpose["BUSINESS_EXPANSION"] = "business_expansion";
    LoanPurpose["WORKING_CAPITAL"] = "working_capital";
    LoanPurpose["EQUIPMENT_FINANCING"] = "equipment_financing";
    LoanPurpose["INVENTORY_PURCHASE"] = "inventory_purchase";
    LoanPurpose["MARKETING"] = "marketing";
    LoanPurpose["RENOVATION"] = "renovation";
    LoanPurpose["VEHICLE_FINANCING"] = "vehicle_financing";
    LoanPurpose["WEDDING"] = "wedding";
    LoanPurpose["VACATION"] = "vacation";
    LoanPurpose["EMERGENCY"] = "emergency";
    LoanPurpose["OTHER"] = "other";
})(LoanPurpose || (exports.LoanPurpose = LoanPurpose = {}));
var LoanRiskGrade;
(function (LoanRiskGrade) {
    LoanRiskGrade["A_PLUS"] = "A+";
    LoanRiskGrade["A"] = "A";
    LoanRiskGrade["A_MINUS"] = "A-";
    LoanRiskGrade["B_PLUS"] = "B+";
    LoanRiskGrade["B"] = "B";
    LoanRiskGrade["B_MINUS"] = "B-";
    LoanRiskGrade["C_PLUS"] = "C+";
    LoanRiskGrade["C"] = "C";
    LoanRiskGrade["C_MINUS"] = "C-";
    LoanRiskGrade["D"] = "D";
    LoanRiskGrade["E"] = "E";
    LoanRiskGrade["F"] = "F";
    LoanRiskGrade["G"] = "G";
    LoanRiskGrade["H"] = "H";
})(LoanRiskGrade || (exports.LoanRiskGrade = LoanRiskGrade = {}));
var LoanCollateralType;
(function (LoanCollateralType) {
    LoanCollateralType["REAL_ESTATE"] = "real_estate";
    LoanCollateralType["VEHICLE"] = "vehicle";
    LoanCollateralType["EQUIPMENT"] = "equipment";
    LoanCollateralType["INVENTORY"] = "inventory";
    LoanCollateralType["ACCOUNTS_RECEIVABLE"] = "accounts_receivable";
    LoanCollateralType["CASH"] = "cash";
    LoanCollateralType["INVESTMENTS"] = "investments";
    LoanCollateralType["PERSONAL_GUARANTEE"] = "personal_guarantee";
    LoanCollateralType["CORPORATE_GUARANTEE"] = "corporate_guarantee";
    LoanCollateralType["CROP"] = "crop";
    LoanCollateralType["LIVESTOCK"] = "livestock";
    LoanCollateralType["INTELLECTUAL_PROPERTY"] = "intellectual_property";
    LoanCollateralType["NONE"] = "none";
})(LoanCollateralType || (exports.LoanCollateralType = LoanCollateralType = {}));
var LoanVerificationStatus;
(function (LoanVerificationStatus) {
    LoanVerificationStatus["PENDING"] = "pending";
    LoanVerificationStatus["DOCUMENTS_UPLOADED"] = "documents_uploaded";
    LoanVerificationStatus["UNDER_REVIEW"] = "under_review";
    LoanVerificationStatus["VERIFIED"] = "verified";
    LoanVerificationStatus["REJECTED"] = "rejected";
    LoanVerificationStatus["ADDITIONAL_INFO_REQUIRED"] = "additional_info_required";
})(LoanVerificationStatus || (exports.LoanVerificationStatus = LoanVerificationStatus = {}));
exports.LOAN_STATUS_FLOW = {
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
exports.LOAN_STATUS_LABELS = {
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
//# sourceMappingURL=loan-status.enum.js.map