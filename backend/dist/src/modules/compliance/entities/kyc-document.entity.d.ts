import { Kyc } from './kyc.entity';
export declare enum KycDocumentType {
    PASSPORT = "passport",
    DRIVERS_LICENSE = "drivers_license",
    NATIONAL_ID = "national_id",
    RESIDENCE_PERMIT = "residence_permit",
    UTILITY_BILL = "utility_bill",
    BANK_STATEMENT = "bank_statement",
    TAX_RETURN = "tax_return",
    INCORPORATION_CERTIFICATE = "incorporation_certificate",
    ARTICLES_OF_ASSOCIATION = "articles_of_association",
    PROOF_OF_ADDRESS = "proof_of_address",
    SELFIE = "selfie",
    OTHER = "other"
}
export declare enum KycDocumentStatus {
    PENDING = "pending",
    UPLOADED = "uploaded",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class KycDocument {
    id: string;
    kycId: string;
    type: KycDocumentType;
    status: KycDocumentStatus;
    name: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    documentNumber: string;
    issueDate: Date;
    expiryDate: Date;
    countryOfIssue: string;
    uploadedAt: Date;
    verifiedAt: Date;
    verifiedBy: string;
    rejectedAt: Date;
    rejectedBy: string;
    rejectionReason: string;
    notes: string;
    isFrontSide: boolean;
    extractedData: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    kyc: Kyc;
    get isVerified(): boolean;
    get isRejected(): boolean;
    get isExpired(): boolean;
    get isUploaded(): boolean;
    get isPending(): boolean;
    get fileExtension(): string;
    get fileSizeFormatted(): string;
    get daysUntilExpiry(): number | null;
}
