import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanGuarantor } from './loan-guarantor.entity';
import { LoanCollateral } from './loan-collateral.entity';
export declare enum DocumentType {
    IDENTITY_PROOF = "identity_proof",
    ADDRESS_PROOF = "address_proof",
    INCOME_PROOF = "income_proof",
    BANK_STATEMENT = "bank_statement",
    TAX_RETURN = "tax_return",
    BUSINESS_REGISTRATION = "business_registration",
    COLLATERAL_DOCUMENT = "collateral_document",
    GUARANTOR_DOCUMENT = "guarantor_document",
    LOAN_AGREEMENT = "loan_agreement",
    REPAYMENT_SCHEDULE = "repayment_schedule",
    DISBURSEMENT_PROOF = "disbursement_proof",
    PAYMENT_RECEIPT = "payment_receipt",
    LEGAL_DOCUMENT = "legal_document",
    OTHER = "other"
}
export declare enum DocumentStatus {
    PENDING_UPLOAD = "pending_upload",
    UPLOADED = "uploaded",
    UNDER_REVIEW = "under_review",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare enum DocumentFormat {
    PDF = "pdf",
    JPEG = "jpeg",
    PNG = "png",
    DOC = "doc",
    DOCX = "docx",
    XLS = "xls",
    XLSX = "xlsx",
    TXT = "txt"
}
export declare enum VerificationMethod {
    MANUAL = "manual",
    AUTOMATED = "automated",
    THIRD_PARTY = "third_party"
}
export declare class LoanDocument {
    id: string;
    documentNumber: string;
    loanId: string;
    loanApplicationId: string;
    guarantorId: string;
    collateralId: string;
    documentType: DocumentType;
    name: string;
    description: string;
    fileName: string;
    fileSize: number;
    fileFormat: DocumentFormat;
    mimeType: string;
    storagePath: string;
    thumbnailPath: string;
    fileHash: string;
    status: DocumentStatus;
    verificationStatus: string;
    verificationMethod: VerificationMethod;
    verificationScore: number;
    verificationDetails: Record<string, any>;
    rejectionReason: string;
    internalNotes: string;
    tags: string[];
    metadata: Record<string, any>;
    extractedText: string;
    ocrConfidence: number;
    expiryDate: Date;
    issueDate: Date;
    documentNumberOnFile: string;
    issuingAuthority: string;
    issuingCountry: string;
    isRequired: boolean;
    isConfidential: boolean;
    isShared: boolean;
    sharedWith: string[];
    retentionPeriodMonths: number;
    autoDeleteDate: Date;
    uploadedById: string;
    uploadedAt: Date;
    verifiedById: string;
    verifiedAt: Date;
    rejectedAt: Date;
    reviewStartDate: Date;
    reviewEndDate: Date;
    lastViewedAt: Date;
    lastViewedById: string;
    downloadCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    loan: Loan;
    loanApplication: LoanApplication;
    guarantor: LoanGuarantor;
    collateral: LoanCollateral;
    get fileSizeFormatted(): string;
    get isUploaded(): boolean;
    get isVerified(): boolean;
    get isRejected(): boolean;
    get isUnderReview(): boolean;
    get isExpired(): boolean;
    get daysUntilExpiry(): number | null;
    get ageInDays(): number;
    get needsReview(): boolean;
    get isValid(): boolean;
    get category(): string;
    beforeInsert(): Promise<void>;
    beforeUpdate(): Promise<void>;
    afterInsert(): Promise<void>;
    afterUpdate(): Promise<void>;
    private generateDocumentNumber;
    upload(fileName: string, fileSize: number, fileFormat: DocumentFormat, mimeType: string, storagePath: string, uploadedById: string, fileHash?: string, thumbnailPath?: string): void;
    verify(verifiedById: string, verificationMethod: VerificationMethod, verificationScore?: number): void;
    reject(reason: string, rejectedById?: string): void;
    startReview(): void;
    markAsExpired(): void;
    incrementView(userId?: string): void;
    incrementDownload(): void;
    toJSON(): Partial<LoanDocument>;
}
