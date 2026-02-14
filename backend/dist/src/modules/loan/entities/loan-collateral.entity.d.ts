import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanDocument } from './loan-document.entity';
export declare enum CollateralType {
    REAL_ESTATE = "real_estate",
    VEHICLE = "vehicle",
    EQUIPMENT = "equipment",
    INVENTORY = "inventory",
    ACCOUNTS_RECEIVABLE = "accounts_receivable",
    SAVINGS_ACCOUNT = "savings_account",
    INVESTMENT_PORTFOLIO = "investment_portfolio",
    JEWELRY = "jewelry",
    ART = "art",
    OTHER = "other"
}
export declare enum CollateralStatus {
    PENDING = "pending",
    ACTIVE = "active",
    RELEASED = "released",
    SEIZED = "seized",
    SOLD = "sold",
    DAMAGED = "damaged",
    LOST = "lost",
    UNDER_REVIEW = "under_review"
}
export declare enum OwnershipType {
    SOLE = "sole",
    JOINT = "joint",
    CORPORATE = "corporate",
    TRUST = "trust"
}
export declare enum InsuranceStatus {
    NOT_INSURED = "not_insured",
    INSURED = "insured",
    UNDER_INSURED = "under_insured",
    INSURANCE_EXPIRED = "insurance_expired"
}
export declare class LoanCollateral {
    id: string;
    collateralNumber: string;
    loanId: string;
    loanApplicationId: string;
    collateralType: CollateralType;
    name: string;
    description: string;
    appraisedValue: number;
    currency: string;
    loanToValueRatio: number;
    maxLoanAmount: number;
    coverageRatio: number;
    marketValue: number;
    forcedSaleValue: number;
    purchasePrice: number;
    purchaseDate: Date;
    yearOfManufacture: number;
    make: string;
    model: string;
    registrationNumber: string;
    vinNumber: string;
    engineNumber: string;
    propertyAddress: string;
    propertySize: number;
    propertySizeUnit: string;
    landSize: number;
    landSizeUnit: string;
    quantity: number;
    unitOfMeasure: string;
    condition: string;
    age: number;
    depreciationRate: number;
    residualValue: number;
    ownershipType: OwnershipType;
    ownershipPercentage: number;
    coOwners: Array<{
        name: string;
        percentage: number;
        relationship: string;
        idNumber?: string;
    }>;
    legalOwner: string;
    titleNumber: string;
    titleDate: Date;
    titleDocumentPath: string;
    insuranceStatus: InsuranceStatus;
    insuranceCompany: string;
    insurancePolicyNumber: string;
    insuranceCoverageAmount: number;
    insurancePremium: number;
    insuranceExpiryDate: Date;
    insuranceDocumentPath: string;
    storageLocation: string;
    storageContact: string;
    storageCost: number;
    storagePeriod: string;
    inspectionSchedule: string;
    lastInspectionDate: Date;
    nextInspectionDate: Date;
    inspectionReportPath: string;
    maintenanceRequirements: string;
    maintenanceCost: number;
    status: CollateralStatus;
    statusChangeReason: string;
    releasedAt: Date;
    seizedAt: Date;
    soldAt: Date;
    salePrice: number;
    saleProceedsDistribution: Record<string, number>;
    damageDate: Date;
    damageDescription: string;
    estimatedRepairCost: number;
    insuranceClaimNumber: string;
    insuranceClaimStatus: string;
    insuranceSettlementAmount: number;
    riskScore: number;
    riskFactors: string[];
    riskMitigation: string[];
    notes: string;
    internalNotes: string;
    tags: string[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    version: number;
    loan: Loan;
    loanApplication: LoanApplication;
    documents: LoanDocument[];
    get currentValue(): number;
    get depreciationAmount(): number;
    get isInsured(): boolean;
    get isInsuranceExpired(): boolean;
    get daysUntilInsuranceExpiry(): number | null;
    get isActive(): boolean;
    get isReleased(): boolean;
    get isSeized(): boolean;
    get isSold(): boolean;
    get isDamaged(): boolean;
    get isLost(): boolean;
    get isUnderReview(): boolean;
    get ageInYears(): number;
    get insuranceCoverageAdequacy(): number;
    get hasAdequateInsurance(): boolean;
    get valueVariance(): number;
    get liquidationValuePercentage(): number;
    get daysUntilNextInspection(): number | null;
    beforeInsert(): Promise<void>;
    beforeUpdate(): Promise<void>;
    afterInsert(): Promise<void>;
    afterUpdate(): Promise<void>;
    private generateCollateralNumber;
    private calculateDerivedValues;
    private handleStatusTransitions;
    private checkInsuranceExpiry;
    private scheduleNextInspection;
    activate(): void;
    release(reason: string): void;
    seize(reason: string): void;
    sell(price: number, distribution: Record<string, number>, notes?: string): void;
    markAsDamaged(description: string, estimatedCost: number, claimNumber?: string): void;
    markAsLost(description: string, claimNumber?: string): void;
    updateInsurance(company: string, policyNumber: string, coverageAmount: number, premium: number, expiryDate: Date, documentPath?: string): void;
    recordInspection(reportPath: string, findings?: string): void;
    updateAppraisal(value: number, currency?: string): void;
    calculateRiskScore(): number;
    getValueSummary(): {
        appraised: number;
        current: number;
        market: number;
        forcedSale: number;
        currency: string;
    };
    getInsuranceSummary(): {
        status: string;
        company?: string;
        coverage: number;
        expiry?: Date;
        adequacy: number;
    };
    getInspectionSummary(): {
        last: Date;
        next: Date;
        overdue: boolean;
        daysUntil: number;
    };
    toJSON(): any;
    toString(): string;
    get isRealEstate(): boolean;
    get isVehicle(): boolean;
    get isLiquid(): boolean;
    get requiresPhysicalStorage(): boolean;
    get requiresRegularInspection(): boolean;
    get documentationRequirements(): string[];
}
