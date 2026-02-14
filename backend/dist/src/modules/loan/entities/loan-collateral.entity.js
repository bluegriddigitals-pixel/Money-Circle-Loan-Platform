"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanCollateral = exports.InsuranceStatus = exports.OwnershipType = exports.CollateralStatus = exports.CollateralType = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const loan_entity_1 = require("./loan.entity");
const loan_application_entity_1 = require("./loan-application.entity");
const loan_document_entity_1 = require("./loan-document.entity");
var CollateralType;
(function (CollateralType) {
    CollateralType["REAL_ESTATE"] = "real_estate";
    CollateralType["VEHICLE"] = "vehicle";
    CollateralType["EQUIPMENT"] = "equipment";
    CollateralType["INVENTORY"] = "inventory";
    CollateralType["ACCOUNTS_RECEIVABLE"] = "accounts_receivable";
    CollateralType["SAVINGS_ACCOUNT"] = "savings_account";
    CollateralType["INVESTMENT_PORTFOLIO"] = "investment_portfolio";
    CollateralType["JEWELRY"] = "jewelry";
    CollateralType["ART"] = "art";
    CollateralType["OTHER"] = "other";
})(CollateralType || (exports.CollateralType = CollateralType = {}));
var CollateralStatus;
(function (CollateralStatus) {
    CollateralStatus["PENDING"] = "pending";
    CollateralStatus["ACTIVE"] = "active";
    CollateralStatus["RELEASED"] = "released";
    CollateralStatus["SEIZED"] = "seized";
    CollateralStatus["SOLD"] = "sold";
    CollateralStatus["DAMAGED"] = "damaged";
    CollateralStatus["LOST"] = "lost";
    CollateralStatus["UNDER_REVIEW"] = "under_review";
})(CollateralStatus || (exports.CollateralStatus = CollateralStatus = {}));
var OwnershipType;
(function (OwnershipType) {
    OwnershipType["SOLE"] = "sole";
    OwnershipType["JOINT"] = "joint";
    OwnershipType["CORPORATE"] = "corporate";
    OwnershipType["TRUST"] = "trust";
})(OwnershipType || (exports.OwnershipType = OwnershipType = {}));
var InsuranceStatus;
(function (InsuranceStatus) {
    InsuranceStatus["NOT_INSURED"] = "not_insured";
    InsuranceStatus["INSURED"] = "insured";
    InsuranceStatus["UNDER_INSURED"] = "under_insured";
    InsuranceStatus["INSURANCE_EXPIRED"] = "insurance_expired";
})(InsuranceStatus || (exports.InsuranceStatus = InsuranceStatus = {}));
let LoanCollateral = class LoanCollateral {
    get currentValue() {
        if (this.residualValue !== undefined && this.residualValue !== null) {
            return this.residualValue;
        }
        if (this.appraisedValue && this.age && this.depreciationRate) {
            const depreciation = (this.appraisedValue * this.depreciationRate * this.age) / 100;
            return Math.max(0, this.appraisedValue - depreciation);
        }
        return this.appraisedValue || 0;
    }
    get depreciationAmount() {
        return (this.appraisedValue || 0) - this.currentValue;
    }
    get isInsured() {
        return this.insuranceStatus === InsuranceStatus.INSURED;
    }
    get isInsuranceExpired() {
        if (!this.insuranceExpiryDate)
            return false;
        return new Date() > this.insuranceExpiryDate;
    }
    get daysUntilInsuranceExpiry() {
        if (!this.insuranceExpiryDate)
            return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(this.insuranceExpiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get isActive() {
        return this.status === CollateralStatus.ACTIVE;
    }
    get isReleased() {
        return this.status === CollateralStatus.RELEASED;
    }
    get isSeized() {
        return this.status === CollateralStatus.SEIZED;
    }
    get isSold() {
        return this.status === CollateralStatus.SOLD;
    }
    get isDamaged() {
        return this.status === CollateralStatus.DAMAGED;
    }
    get isLost() {
        return this.status === CollateralStatus.LOST;
    }
    get isUnderReview() {
        return this.status === CollateralStatus.UNDER_REVIEW;
    }
    get ageInYears() {
        if (this.age !== undefined && this.age !== null) {
            return this.age;
        }
        if (this.yearOfManufacture) {
            const currentYear = new Date().getFullYear();
            return currentYear - this.yearOfManufacture;
        }
        if (this.purchaseDate) {
            const purchase = new Date(this.purchaseDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - purchase.getTime());
            return diffTime / (1000 * 60 * 60 * 24 * 365.25);
        }
        return 0;
    }
    get insuranceCoverageAdequacy() {
        if (!this.insuranceCoverageAmount || !this.currentValue || this.currentValue === 0) {
            return 0;
        }
        return (this.insuranceCoverageAmount / this.currentValue) * 100;
    }
    get hasAdequateInsurance() {
        return this.insuranceCoverageAdequacy >= 90;
    }
    get valueVariance() {
        if (!this.marketValue || !this.appraisedValue || this.appraisedValue === 0) {
            return 0;
        }
        return ((this.marketValue - this.appraisedValue) / this.appraisedValue) * 100;
    }
    get liquidationValuePercentage() {
        if (!this.forcedSaleValue || !this.currentValue || this.currentValue === 0) {
            return 0;
        }
        return (this.forcedSaleValue / this.currentValue) * 100;
    }
    get daysUntilNextInspection() {
        if (!this.nextInspectionDate)
            return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inspection = new Date(this.nextInspectionDate);
        inspection.setHours(0, 0, 0, 0);
        const diffTime = inspection.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    async beforeInsert() {
        if (!this.collateralNumber) {
            this.collateralNumber = this.generateCollateralNumber();
        }
        this.calculateDerivedValues();
        this.scheduleNextInspection();
    }
    async beforeUpdate() {
        this.version += 1;
        this.calculateDerivedValues();
        this.handleStatusTransitions();
        this.checkInsuranceExpiry();
    }
    async afterInsert() {
        console.log(`Loan collateral created: ${this.collateralNumber} (${this.id})`);
    }
    async afterUpdate() {
        console.log(`Loan collateral updated: ${this.collateralNumber} (${this.id})`);
    }
    generateCollateralNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `COL-${new Date().getFullYear()}-${timestamp}${random}`;
    }
    calculateDerivedValues() {
        this.currentValue;
        if (this.appraisedValue && this.appraisedValue > 0) {
            this.coverageRatio = this.appraisedValue / (this.maxLoanAmount || 1);
        }
        if (!this.residualValue && this.appraisedValue && this.age && this.depreciationRate) {
            const depreciation = (this.appraisedValue * this.depreciationRate * this.age) / 100;
            this.residualValue = Math.max(0, this.appraisedValue - depreciation);
        }
        if (!this.maxLoanAmount && this.appraisedValue && this.loanToValueRatio) {
            this.maxLoanAmount = (this.appraisedValue * this.loanToValueRatio) / 100;
        }
        if (!this.loanToValueRatio && this.appraisedValue && this.appraisedValue > 0 && this.maxLoanAmount) {
            this.loanToValueRatio = (this.maxLoanAmount / this.appraisedValue) * 100;
        }
    }
    handleStatusTransitions() {
        const now = new Date();
        if (this.status === CollateralStatus.RELEASED && !this.releasedAt) {
            this.releasedAt = now;
        }
        if (this.status === CollateralStatus.SEIZED && !this.seizedAt) {
            this.seizedAt = now;
        }
        if (this.status === CollateralStatus.SOLD && !this.soldAt) {
            this.soldAt = now;
        }
        if (this.status === CollateralStatus.DAMAGED && !this.damageDate) {
            this.damageDate = now;
        }
    }
    checkInsuranceExpiry() {
        if (this.insuranceExpiryDate && new Date() > this.insuranceExpiryDate) {
            this.insuranceStatus = InsuranceStatus.INSURANCE_EXPIRED;
        }
    }
    scheduleNextInspection() {
        if (!this.inspectionSchedule || !this.lastInspectionDate) {
            return;
        }
        const lastInspection = new Date(this.lastInspectionDate);
        const nextInspection = new Date(lastInspection);
        switch (this.inspectionSchedule) {
            case 'monthly':
                nextInspection.setMonth(nextInspection.getMonth() + 1);
                break;
            case 'quarterly':
                nextInspection.setMonth(nextInspection.getMonth() + 3);
                break;
            case 'semi_annually':
                nextInspection.setMonth(nextInspection.getMonth() + 6);
                break;
            case 'annually':
                nextInspection.setFullYear(nextInspection.getFullYear() + 1);
                break;
            default:
                return;
        }
        this.nextInspectionDate = nextInspection;
    }
    activate() {
        if (this.isActive) {
            throw new Error('Collateral is already active');
        }
        if (this.isReleased || this.isSeized || this.isSold || this.isDamaged || this.isLost) {
            throw new Error('Cannot activate collateral in current state');
        }
        this.status = CollateralStatus.ACTIVE;
    }
    release(reason) {
        if (!this.isActive) {
            throw new Error('Only active collateral can be released');
        }
        this.status = CollateralStatus.RELEASED;
        this.statusChangeReason = reason;
        this.releasedAt = new Date();
    }
    seize(reason) {
        if (!this.isActive) {
            throw new Error('Only active collateral can be seized');
        }
        this.status = CollateralStatus.SEIZED;
        this.statusChangeReason = reason;
        this.seizedAt = new Date();
    }
    sell(price, distribution, notes) {
        if (!this.isSeized) {
            throw new Error('Only seized collateral can be sold');
        }
        if (price <= 0) {
            throw new Error('Sale price must be greater than zero');
        }
        this.salePrice = price;
        this.saleProceedsDistribution = distribution;
        this.status = CollateralStatus.SOLD;
        this.soldAt = new Date();
        if (notes) {
            this.notes = notes;
        }
    }
    markAsDamaged(description, estimatedCost, claimNumber) {
        if (!this.isActive) {
            throw new Error('Only active collateral can be marked as damaged');
        }
        this.damageDescription = description;
        this.estimatedRepairCost = estimatedCost;
        this.insuranceClaimNumber = claimNumber;
        this.status = CollateralStatus.DAMAGED;
        this.damageDate = new Date();
        this.insuranceClaimStatus = claimNumber ? 'filed' : 'not_filed';
    }
    markAsLost(description, claimNumber) {
        if (!this.isActive) {
            throw new Error('Only active collateral can be marked as lost');
        }
        this.damageDescription = description;
        this.insuranceClaimNumber = claimNumber;
        this.status = CollateralStatus.LOST;
        this.damageDate = new Date();
        this.insuranceClaimStatus = claimNumber ? 'filed' : 'not_filed';
    }
    updateInsurance(company, policyNumber, coverageAmount, premium, expiryDate, documentPath) {
        this.insuranceCompany = company;
        this.insurancePolicyNumber = policyNumber;
        this.insuranceCoverageAmount = coverageAmount;
        this.insurancePremium = premium;
        this.insuranceExpiryDate = expiryDate;
        this.insuranceDocumentPath = documentPath;
        this.insuranceStatus = InsuranceStatus.INSURED;
    }
    recordInspection(reportPath, findings) {
        this.lastInspectionDate = new Date();
        this.inspectionReportPath = reportPath;
        if (findings) {
            this.notes = (this.notes || '') + `\nInspection findings: ${findings}`;
        }
        this.scheduleNextInspection();
    }
    updateAppraisal(value, currency = 'USD') {
        if (value <= 0) {
            throw new Error('Appraisal value must be greater than zero');
        }
        this.appraisedValue = value;
        this.currency = currency;
        this.calculateDerivedValues();
    }
    calculateRiskScore() {
        let score = 100;
        if (this.ageInYears > 10)
            score -= 20;
        else if (this.ageInYears > 5)
            score -= 10;
        if (!this.isInsured)
            score -= 30;
        else if (!this.hasAdequateInsurance)
            score -= 15;
        else if (this.isInsuranceExpired)
            score -= 25;
        if (this.condition === 'poor')
            score -= 20;
        else if (this.condition === 'fair')
            score -= 10;
        else if (this.condition === 'good')
            score -= 5;
        if (this.depreciationRate && this.depreciationRate > 20)
            score -= 15;
        else if (this.depreciationRate && this.depreciationRate > 10)
            score -= 8;
        if (this.daysUntilNextInspection !== null && this.daysUntilNextInspection < 0) {
            score -= Math.min(20, Math.abs(this.daysUntilNextInspection) * 2);
        }
        return Math.max(0, Math.min(100, score));
    }
    getValueSummary() {
        return {
            appraised: this.appraisedValue,
            current: this.currentValue,
            market: this.marketValue || 0,
            forcedSale: this.forcedSaleValue || 0,
            currency: this.currency,
        };
    }
    getInsuranceSummary() {
        return {
            status: this.insuranceStatus,
            company: this.insuranceCompany,
            coverage: this.insuranceCoverageAmount || 0,
            expiry: this.insuranceExpiryDate,
            adequacy: this.insuranceCoverageAdequacy,
        };
    }
    getInspectionSummary() {
        return {
            last: this.lastInspectionDate,
            next: this.nextInspectionDate,
            overdue: this.daysUntilNextInspection !== null && this.daysUntilNextInspection < 0,
            daysUntil: this.daysUntilNextInspection || 0,
        };
    }
    toJSON() {
        const obj = { ...this };
        delete obj.internalNotes;
        delete obj.deletedAt;
        delete obj.version;
        delete obj.metadata;
        delete obj.riskFactors;
        delete obj.riskMitigation;
        return obj;
    }
    toString() {
        return `LoanCollateral#${this.collateralNumber} (${this.collateralType})`;
    }
    get isRealEstate() {
        return this.collateralType === CollateralType.REAL_ESTATE;
    }
    get isVehicle() {
        return this.collateralType === CollateralType.VEHICLE;
    }
    get isLiquid() {
        return [
            CollateralType.SAVINGS_ACCOUNT,
            CollateralType.INVESTMENT_PORTFOLIO,
            CollateralType.ACCOUNTS_RECEIVABLE,
        ].includes(this.collateralType);
    }
    get requiresPhysicalStorage() {
        return [
            CollateralType.REAL_ESTATE,
            CollateralType.VEHICLE,
            CollateralType.EQUIPMENT,
            CollateralType.INVENTORY,
            CollateralType.JEWELRY,
            CollateralType.ART,
        ].includes(this.collateralType);
    }
    get requiresRegularInspection() {
        return this.requiresPhysicalStorage && !this.isRealEstate;
    }
    get documentationRequirements() {
        const requirements = ['ownership_proof', 'valuation_report'];
        if (this.isRealEstate) {
            requirements.push('title_deed', 'property_tax_receipt', 'survey_report');
        }
        if (this.isVehicle) {
            requirements.push('registration_certificate', 'insurance_certificate');
        }
        if (this.isInsured) {
            requirements.push('insurance_policy');
        }
        return requirements;
    }
};
exports.LoanCollateral = LoanCollateral;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the collateral',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanCollateral.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique collateral reference number',
        example: 'COL-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "collateralNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan (if associated with a loan)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanCollateral.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan application (if associated with an application)',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanCollateral.prototype, "loanApplicationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Collateral type',
        enum: CollateralType,
        example: CollateralType.REAL_ESTATE,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CollateralType,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(CollateralType),
    __metadata("design:type", String)
], LoanCollateral.prototype, "collateralType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Collateral name/description',
        example: 'Residential Property - 123 Main Street',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], LoanCollateral.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed description',
        example: '3-bedroom house with garage, located in suburban area',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], LoanCollateral.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Appraised value',
        example: 250000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "appraisedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Appraisal currency',
        example: 'USD',
        default: 'USD',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD', nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], LoanCollateral.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan-to-value ratio (LTV) percentage',
        example: 65.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "loanToValueRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum loan amount based on LTV',
        example: 162500.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "maxLoanAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral coverage ratio',
        example: 1.54,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "coverageRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Market value',
        example: 275000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "marketValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Forced sale value (liquidation value)',
        example: 200000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "forcedSaleValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Purchase price (if recently purchased)',
        example: 230000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Purchase date',
        example: '2020-05-15',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Year of manufacture (for vehicles/equipment)',
        example: 2022,
        minimum: 1900,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "yearOfManufacture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Make/brand (for vehicles/equipment)',
        example: 'Toyota',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Model (for vehicles/equipment)',
        example: 'Camry',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Serial/registration number',
        example: 'ABC123456',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, unique: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "registrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'VIN/Chassis number (for vehicles)',
        example: '1HGCM82633A123456',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanCollateral.prototype, "vinNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Engine number (for vehicles)',
        example: 'ENG123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanCollateral.prototype, "engineNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Property address (for real estate)',
        example: '123 Main Street, Anytown, USA 12345',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], LoanCollateral.prototype, "propertyAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Property size (in square feet/meters)',
        example: 2000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 10, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "propertySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Property size unit',
        example: 'sqft',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], LoanCollateral.prototype, "propertySizeUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Land size (in square feet/meters)',
        example: 5000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 10, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "landSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Land size unit',
        example: 'sqft',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], LoanCollateral.prototype, "landSizeUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Quantity (for inventory/equipment)',
        example: 100,
        minimum: 1,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Unit of measure',
        example: 'pieces',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], LoanCollateral.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Condition/grade',
        example: 'excellent',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Age in years',
        example: 5.5,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Depreciation rate (annual percentage)',
        example: 10.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "depreciationRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Residual value after depreciation',
        example: 150000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "residualValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ownership type',
        enum: OwnershipType,
        example: OwnershipType.SOLE,
        default: OwnershipType.SOLE,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OwnershipType,
        default: OwnershipType.SOLE,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(OwnershipType),
    __metadata("design:type", String)
], LoanCollateral.prototype, "ownershipType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ownership percentage (for joint ownership)',
        example: 100.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "ownershipPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Co-owners information',
        example: [
            { name: 'Jane Doe', percentage: 50, relationship: 'spouse' },
            { name: 'John Doe', percentage: 50, relationship: 'self' },
        ],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanCollateral.prototype, "coOwners", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Legal owner name',
        example: 'John Doe',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], LoanCollateral.prototype, "legalOwner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Registration/Title number',
        example: 'T123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "titleNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Registration/Title date',
        example: '2020-05-20',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "titleDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Title deed/registration document storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/title_deed.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "titleDocumentPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance status',
        enum: InsuranceStatus,
        example: InsuranceStatus.INSURED,
        default: InsuranceStatus.NOT_INSURED,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InsuranceStatus,
        default: InsuranceStatus.NOT_INSURED,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(InsuranceStatus),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insuranceStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance company',
        example: 'State Farm Insurance',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insuranceCompany", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance policy number',
        example: 'POL123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance coverage amount',
        example: 250000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance premium amount',
        example: 1500.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "insurancePremium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance expiry date',
        example: '2024-12-31',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "insuranceExpiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance document storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/insurance_policy.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insuranceDocumentPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage location',
        example: 'Secure Storage Facility #123, 456 Warehouse Rd',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "storageLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage facility contact',
        example: 'John Smith, +1234567890',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "storageContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage cost per period',
        example: 100.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "storageCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage period (e.g., monthly, annually)',
        example: 'monthly',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "storagePeriod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inspection schedule',
        example: 'quarterly',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "inspectionSchedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last inspection date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "lastInspectionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Next inspection date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "nextInspectionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inspection report storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/inspection_report_2024.pdf',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "inspectionReportPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maintenance requirements',
        example: 'Annual servicing required',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "maintenanceRequirements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maintenance cost estimate',
        example: 500.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "maintenanceCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Collateral status',
        enum: CollateralStatus,
        example: CollateralStatus.ACTIVE,
        default: CollateralStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CollateralStatus,
        default: CollateralStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(CollateralStatus),
    __metadata("design:type", String)
], LoanCollateral.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Status change reason',
        example: 'Loan fully repaid',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "statusChangeReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release date (when collateral was released)',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "releasedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Seizure date (when collateral was seized)',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "seizedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sale date (when collateral was sold)',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "soldAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sale price',
        example: 240000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "salePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sale proceeds distribution',
        example: {
            loanRepayment: 200000,
            fees: 10000,
            remainderToBorrower: 30000,
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanCollateral.prototype, "saleProceedsDistribution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Damage/loss date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "damageDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Damage/loss description',
        example: 'Fire damage to garage area',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "damageDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated repair cost',
        example: 15000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "estimatedRepairCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance claim number',
        example: 'CLM123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insuranceClaimNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance claim status',
        example: 'pending',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "insuranceClaimStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Insurance settlement amount',
        example: 12000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "insuranceSettlementAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk assessment score (0-100)',
        example: 85.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "riskScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk factors',
        example: ['age', 'location', 'market_volatility'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanCollateral.prototype, "riskFactors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk mitigation measures',
        example: ['insurance', 'regular_inspections', 'secure_storage'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanCollateral.prototype, "riskMitigation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes/comments',
        example: 'Collateral is in excellent condition with regular maintenance',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
        example: 'Requires additional insurance coverage for full value',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateral.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for categorization',
        example: ['primary', 'high_value', 'requires_insurance'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanCollateral.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { customField1: 'value1', customField2: 'value2' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanCollateral.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Collateral creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], LoanCollateral.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Version for optimistic locking',
        example: 1,
        default: 1,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 1, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanCollateral.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan associated with this collateral',
        type: () => loan_entity_1.Loan,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.collaterals, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_entity_1.Loan),
    __metadata("design:type", loan_entity_1.Loan)
], LoanCollateral.prototype, "loan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan application associated with this collateral',
        type: () => loan_application_entity_1.LoanApplication,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_application_entity_1.LoanApplication, (application) => application.collaterals, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanApplicationId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_application_entity_1.LoanApplication),
    __metadata("design:type", loan_application_entity_1.LoanApplication)
], LoanCollateral.prototype, "loanApplication", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral documents',
        type: () => [loan_document_entity_1.LoanDocument],
    }),
    (0, typeorm_1.OneToMany)(() => loan_document_entity_1.LoanDocument, (document) => document.collateral, {
        cascade: true,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_document_entity_1.LoanDocument),
    __metadata("design:type", Array)
], LoanCollateral.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current value (considering depreciation)',
        example: 225000.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "currentValue", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Depreciation amount',
        example: 25000.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "depreciationAmount", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is insured',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isInsured", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether insurance is expired',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isInsuranceExpired", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days until insurance expiry (negative if expired)',
        example: 120,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "daysUntilInsuranceExpiry", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is active',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isActive", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is released',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isReleased", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is seized',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isSeized", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is sold',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isSold", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is damaged',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isDamaged", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is lost',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isLost", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether collateral is under review',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "isUnderReview", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Collateral age in years',
        example: 5.5,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "ageInYears", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Insurance coverage adequacy',
        example: 100.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "insuranceCoverageAdequacy", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether insurance coverage is adequate (>90%)',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "hasAdequateInsurance", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Value variance (market vs appraised)',
        example: 10.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "valueVariance", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liquidation value percentage',
        example: 80.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "liquidationValuePercentage", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days until next inspection (negative if overdue)',
        example: 30,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanCollateral.prototype, "daysUntilNextInspection", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanCollateral.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanCollateral.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanCollateral.prototype, "afterInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanCollateral.prototype, "afterUpdate", null);
exports.LoanCollateral = LoanCollateral = __decorate([
    (0, typeorm_1.Entity)('loan_collaterals'),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['loanApplicationId']),
    (0, typeorm_1.Index)(['collateralType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['registrationNumber'], { unique: true, where: 'registration_number IS NOT NULL' }),
    (0, typeorm_1.Index)(['createdAt'])
], LoanCollateral);
//# sourceMappingURL=loan-collateral.entity.js.map