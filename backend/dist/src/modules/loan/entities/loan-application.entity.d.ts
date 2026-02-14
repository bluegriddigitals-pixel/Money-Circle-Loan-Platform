import { User } from "../../user/entities/user.entity";
import { Loan } from "./loan.entity";
import { LoanDocument } from "./loan-document.entity";
import { LoanCollateral } from "./loan-collateral.entity";
import { LoanGuarantor } from "./loan-guarantor.entity";
export declare enum LoanApplicationStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    PENDING_DOCUMENTS = "pending_documents",
    CONDITIONALLY_APPROVED = "conditionally_approved"
}
export declare enum LoanPurpose {
    PERSONAL = "personal",
    BUSINESS = "business",
    EDUCATION = "education",
    HOME = "home",
    AUTO = "auto",
    DEBT_CONSOLIDATION = "debt_consolidation",
    OTHER = "other"
}
export declare enum EmploymentStatus {
    EMPLOYED = "employed",
    SELF_EMPLOYED = "self_employed",
    UNEMPLOYED = "unemployed",
    RETIRED = "retired",
    STUDENT = "student"
}
export declare class LoanApplication {
    id: string;
    applicationNumber: string;
    userId: string;
    loanId: string;
    status: LoanApplicationStatus;
    purpose: LoanPurpose;
    requestedAmount: number;
    requestedTerm: number;
    offeredRate: number;
    approvedAmount: number;
    approvedTerm: number;
    employmentStatus: EmploymentStatus;
    annualIncome: number;
    monthlyExpenses: number;
    creditScore: number;
    riskScore: number;
    riskAssessment: Record<string, any>;
    decisionReason: string;
    decisionedBy: string;
    decisionedAt: Date;
    submittedAt: Date;
    expiresAt: Date;
    metadata: Record<string, any>;
    internalNotes: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    version: number;
    user: User;
    loan: Loan;
    documents: LoanDocument[];
    collaterals: LoanCollateral[];
    guarantors: LoanGuarantor[];
    generateApplicationNumber(): void;
    updateVersion(): void;
    get isExpired(): boolean;
    get isComplete(): boolean;
    get daysSinceSubmission(): number | null;
    submit(): void;
    approve(amount: number, term: number, rate: number, approvedBy: string): void;
    reject(reason: string, rejectedBy: string): void;
    cancel(): void;
}
