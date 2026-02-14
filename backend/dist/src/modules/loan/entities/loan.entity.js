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
exports.Loan = exports.RepaymentFrequency = exports.LoanType = exports.LoanStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const user_entity_1 = require("../../user/entities/user.entity");
const loan_application_entity_1 = require("./loan-application.entity");
const loan_collateral_entity_1 = require("./loan-collateral.entity");
const loan_document_entity_1 = require("./loan-document.entity");
const loan_guarantor_entity_1 = require("./loan-guarantor.entity");
const loan_repayment_entity_1 = require("./loan-repayment.entity");
const disbursement_entity_1 = require("../../payment/entities/disbursement.entity");
const escrow_account_entity_1 = require("../../payment/entities/escrow-account.entity");
const investment_entity_1 = require("../../marketplace/entities/investment.entity");
const transaction_entity_1 = require("../../payment/entities/transaction.entity");
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["DRAFT"] = "draft";
    LoanStatus["PENDING_APPROVAL"] = "pending_approval";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["FUNDING"] = "funding";
    LoanStatus["ACTIVE"] = "active";
    LoanStatus["COMPLETED"] = "completed";
    LoanStatus["DEFAULTED"] = "defaulted";
    LoanStatus["WRITTEN_OFF"] = "written_off";
    LoanStatus["RESTRUCTURED"] = "restructured";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var LoanType;
(function (LoanType) {
    LoanType["PERSONAL"] = "personal";
    LoanType["BUSINESS"] = "business";
    LoanType["EDUCATION"] = "education";
    LoanType["HOME"] = "home";
    LoanType["AUTO"] = "auto";
    LoanType["DEBT_CONSOLIDATION"] = "debt_consolidation";
    LoanType["PAYDAY"] = "payday";
    LoanType["OTHER"] = "other";
})(LoanType || (exports.LoanType = LoanType = {}));
var RepaymentFrequency;
(function (RepaymentFrequency) {
    RepaymentFrequency["WEEKLY"] = "weekly";
    RepaymentFrequency["BI_WEEKLY"] = "bi_weekly";
    RepaymentFrequency["MONTHLY"] = "monthly";
    RepaymentFrequency["QUARTERLY"] = "quarterly";
    RepaymentFrequency["ANNUALLY"] = "annually";
})(RepaymentFrequency || (exports.RepaymentFrequency = RepaymentFrequency = {}));
let Loan = class Loan {
    async beforeInsert() {
        if (!this.loanNumber) {
            this.loanNumber = this.generateLoanNumber();
        }
        this.outstandingBalance = this.amount;
        this.calculateMonthlyInstallment();
    }
    async beforeUpdate() {
        this.version += 1;
        this.calculateOutstandingBalance();
        this.updateLoanStatus();
    }
    async afterInsert() {
        console.log(`Loan created: ${this.loanNumber} (${this.id})`);
    }
    async afterUpdate() {
        console.log(`Loan updated: ${this.loanNumber} (${this.id})`);
    }
    generateLoanNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `LN-${year}-${random}`;
    }
    calculateMonthlyInstallment() {
        if (this.amount && this.interestRate && this.tenureMonths) {
            const monthlyRate = this.interestRate / 100 / 12;
            const factor = Math.pow(1 + monthlyRate, this.tenureMonths);
            this.monthlyInstallment = this.amount * (monthlyRate * factor) / (factor - 1);
            this.totalInterest = (this.monthlyInstallment * this.tenureMonths) - this.amount;
        }
    }
    calculateOutstandingBalance() {
        this.outstandingBalance = Math.max(0, (this.amount + (this.totalInterest || 0) + (this.totalFees || 0)) - this.amountPaid);
    }
    updateLoanStatus() {
        if (this.outstandingBalance <= 0 && this.status === LoanStatus.ACTIVE) {
            this.status = LoanStatus.COMPLETED;
            this.completedAt = new Date();
        }
    }
    get progressPercentage() {
        if (!this.amount)
            return 0;
        return (this.amountPaid / this.amount) * 100;
    }
    get remainingMonths() {
        if (!this.tenureMonths || !this.createdAt)
            return null;
        const startDate = this.disbursementDate || this.createdAt;
        const elapsedMonths = this.getMonthDifference(new Date(), startDate);
        return Math.max(0, this.tenureMonths - elapsedMonths);
    }
    getMonthDifference(date1, date2) {
        const years = date1.getFullYear() - date2.getFullYear();
        const months = date1.getMonth() - date2.getMonth();
        return years * 12 + months;
    }
    get isActive() {
        return this.status === LoanStatus.ACTIVE;
    }
    get isCompleted() {
        return this.status === LoanStatus.COMPLETED;
    }
    get isDefaulted() {
        return this.status === LoanStatus.DEFAULTED;
    }
    get isApproved() {
        return this.status === LoanStatus.APPROVED;
    }
    get isFunded() {
        return this.status === LoanStatus.FUNDING || this.status === LoanStatus.ACTIVE;
    }
    get daysSinceDisbursement() {
        if (!this.disbursementDate)
            return null;
        const today = new Date();
        const disbursement = new Date(this.disbursementDate);
        const diffTime = today.getTime() - disbursement.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get daysUntilMaturity() {
        if (!this.lastRepaymentDate)
            return null;
        const today = new Date();
        const maturity = new Date(this.lastRepaymentDate);
        const diffTime = maturity.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    approve(approvedBy) {
        if (this.status !== LoanStatus.PENDING_APPROVAL && this.status !== LoanStatus.DRAFT) {
            throw new Error('Loan must be in pending approval or draft status to approve');
        }
        this.status = LoanStatus.APPROVED;
        this.approvedAt = new Date();
        this.approvedBy = approvedBy;
    }
    reject(reason, rejectedBy) {
        if (this.status !== LoanStatus.PENDING_APPROVAL && this.status !== LoanStatus.DRAFT) {
            throw new Error('Loan must be in pending approval or draft status to reject');
        }
        this.status = LoanStatus.REJECTED;
        this.rejectionReason = reason;
        this.rejectedAt = new Date();
        this.approvedBy = rejectedBy;
    }
    disburse(disbursementDate = new Date()) {
        if (this.status !== LoanStatus.APPROVED) {
            throw new Error('Only approved loans can be disbursed');
        }
        this.status = LoanStatus.FUNDING;
        this.disbursementDate = disbursementDate;
        const firstRepayment = new Date(disbursementDate);
        firstRepayment.setDate(firstRepayment.getDate() + 30);
        this.firstRepaymentDate = firstRepayment;
        const lastRepayment = new Date(firstRepayment);
        lastRepayment.setMonth(lastRepayment.getMonth() + this.tenureMonths - 1);
        this.lastRepaymentDate = lastRepayment;
    }
    activate() {
        if (this.status !== LoanStatus.FUNDING) {
            throw new Error('Only funding loans can be activated');
        }
        this.status = LoanStatus.ACTIVE;
    }
    markAsDefaulted(reason) {
        if (this.status !== LoanStatus.ACTIVE) {
            throw new Error('Only active loans can be defaulted');
        }
        this.status = LoanStatus.DEFAULTED;
        this.defaultedAt = new Date();
        this.defaultReason = reason;
    }
    writeOff() {
        if (this.status !== LoanStatus.DEFAULTED) {
            throw new Error('Only defaulted loans can be written off');
        }
        this.status = LoanStatus.WRITTEN_OFF;
    }
    restructure(newAmount, newTenure, newRate) {
        if (this.status !== LoanStatus.ACTIVE && this.status !== LoanStatus.DEFAULTED) {
            throw new Error('Only active or defaulted loans can be restructured');
        }
        this.amount = newAmount;
        this.tenureMonths = newTenure;
        this.interestRate = newRate;
        this.status = LoanStatus.RESTRUCTURED;
        this.calculateMonthlyInstallment();
        this.calculateOutstandingBalance();
    }
    recordPayment(amount) {
        if (amount <= 0) {
            throw new Error('Payment amount must be positive');
        }
        this.amountPaid += amount;
        this.calculateOutstandingBalance();
    }
    addCollateral(collateral) {
        if (!this.collaterals)
            this.collaterals = [];
        this.collaterals.push(collateral);
        this.updateCollateralMetrics();
    }
    removeCollateral(collateralId) {
        if (this.collaterals) {
            this.collaterals = this.collaterals.filter(c => c.id !== collateralId);
            this.updateCollateralMetrics();
        }
    }
    updateCollateralMetrics() {
        if (this.collaterals && this.collaterals.length > 0) {
            this.totalCollateralValue = this.collaterals.reduce((sum, collateral) => sum + (collateral.appraisedValue || 0), 0);
            if (this.totalCollateralValue > 0) {
                this.collateralCoverageRatio = this.amount / this.totalCollateralValue;
                this.loanToValueRatio = (this.amount / this.totalCollateralValue) * 100;
            }
        }
    }
    getSummary() {
        let nextPaymentDate;
        if (this.repayments) {
            const nextPayment = this.repayments
                .filter(r => r.status === 'pending')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
            if (nextPayment) {
                nextPaymentDate = nextPayment.dueDate;
            }
        }
        return {
            id: this.id,
            loanNumber: this.loanNumber,
            amount: this.amount,
            outstandingBalance: this.outstandingBalance,
            monthlyInstallment: this.monthlyInstallment || 0,
            interestRate: this.interestRate,
            status: this.status,
            progress: this.progressPercentage,
            nextPaymentDate,
        };
    }
    toJSON() {
        return {
            id: this.id,
            loanNumber: this.loanNumber,
            amount: this.amount,
            tenureMonths: this.tenureMonths,
            interestRate: this.interestRate,
            type: this.type,
            status: this.status,
            purpose: this.purpose,
            amountPaid: this.amountPaid,
            outstandingBalance: this.outstandingBalance,
            monthlyInstallment: this.monthlyInstallment,
            disbursementDate: this.disbursementDate,
            firstRepaymentDate: this.firstRepaymentDate,
            lastRepaymentDate: this.lastRepaymentDate,
            isActive: this.isActive,
            isCompleted: this.isCompleted,
            isDefaulted: this.isDefaulted,
            progressPercentage: this.progressPercentage,
            remainingMonths: this.remainingMonths,
            daysSinceDisbursement: this.daysSinceDisbursement,
            daysUntilMaturity: this.daysUntilMaturity,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.Loan = Loan;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the loan',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Loan.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique loan number',
        example: 'LN-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Loan.prototype, "loanNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the loan application (if originated from application)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Loan.prototype, "loanApplicationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Borrower user ID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Loan.prototype, "borrowerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loan amount',
        example: 50000.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], Loan.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loan tenure in months',
        example: 36,
        minimum: 1,
        maximum: 360,
    }),
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(360),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], Loan.prototype, "tenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Interest rate (annual percentage)',
        example: 12.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], Loan.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan type',
        enum: LoanType,
        example: LoanType.PERSONAL,
        default: LoanType.PERSONAL,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LoanType,
        default: LoanType.PERSONAL,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(LoanType),
    __metadata("design:type", String)
], Loan.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loan status',
        enum: LoanStatus,
        example: LoanStatus.ACTIVE,
        default: LoanStatus.DRAFT,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LoanStatus,
        default: LoanStatus.DRAFT,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(LoanStatus),
    __metadata("design:type", String)
], Loan.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan purpose',
        example: 'Home renovation',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], Loan.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Repayment frequency',
        enum: RepaymentFrequency,
        example: RepaymentFrequency.MONTHLY,
        default: RepaymentFrequency.MONTHLY,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RepaymentFrequency,
        default: RepaymentFrequency.MONTHLY,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(RepaymentFrequency),
    __metadata("design:type", String)
], Loan.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount already paid',
        example: 15000.00,
        minimum: 0,
        default: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Outstanding balance',
        example: 35000.00,
        minimum: 0,
        default: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "outstandingBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total interest amount',
        example: 11250.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "totalInterest", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total fees amount',
        example: 500.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "totalFees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monthly installment amount',
        example: 1500.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "monthlyInstallment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Disbursement date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "disbursementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'First repayment date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "firstRepaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last repayment date (maturity date)',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "lastRepaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Approval date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Approved by user ID',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Loan.prototype, "approvedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection reason',
        example: 'Insufficient credit score',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Loan.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "defaultedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default reason',
        example: 'Missed 3 consecutive payments',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Loan.prototype, "defaultReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Completion date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Loan.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Currency code',
        example: 'USD',
        default: 'USD',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD', nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], Loan.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Grace period in days',
        example: 15,
        minimum: 0,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'int', default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "gracePeriodDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Late payment penalty percentage',
        example: 2.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], Loan.prototype, "latePenaltyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Late payment penalty amount',
        example: 50.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "latePenaltyAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of late payments',
        example: 2,
        minimum: 0,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'int', default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "latePaymentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of missed payments',
        example: 1,
        minimum: 0,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'int', default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "missedPaymentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk rating',
        example: 'A',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Loan.prototype, "riskRating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Credit score at disbursement',
        example: 720,
        minimum: 300,
        maximum: 850,
    }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    __metadata("design:type", Number)
], Loan.prototype, "creditScoreAtDisbursement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Debt-to-income ratio',
        example: 35.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], Loan.prototype, "debtToIncomeRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral coverage ratio',
        example: 1.5,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "collateralCoverageRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total collateral value',
        example: 75000.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Loan.prototype, "totalCollateralValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan-to-value ratio',
        example: 66.67,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], Loan.prototype, "loanToValueRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for categorization',
        example: ['secured', 'high_value', 'repeat_customer'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], Loan.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { source: 'web', campaign: 'summer2024', referrer: 'google' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], Loan.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
        example: 'Customer is a high net worth individual',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Loan.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loan creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], Loan.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], Loan.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], Loan.prototype, "deletedAt", void 0);
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
], Loan.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transactions for this loan',
        type: () => [transaction_entity_1.Transaction],
    }),
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => transaction_entity_1.Transaction),
    __metadata("design:type", Array)
], Loan.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Investments in this loan',
        type: () => [investment_entity_1.Investment],
    }),
    (0, typeorm_1.OneToMany)(() => investment_entity_1.Investment, (investment) => investment.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => investment_entity_1.Investment),
    __metadata("design:type", Array)
], Loan.prototype, "investments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Borrower user',
        type: () => user_entity_1.User,
    }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.loans, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'borrowerId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Loan.prototype, "borrower", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan application that originated this loan',
        type: () => loan_application_entity_1.LoanApplication,
    }),
    (0, typeorm_1.OneToOne)(() => loan_application_entity_1.LoanApplication, (application) => application.loan, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanApplicationId' }),
    __metadata("design:type", loan_application_entity_1.LoanApplication)
], Loan.prototype, "loanApplication", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collateral securing this loan',
        type: () => [loan_collateral_entity_1.LoanCollateral],
    }),
    (0, typeorm_1.OneToMany)(() => loan_collateral_entity_1.LoanCollateral, (collateral) => collateral.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_collateral_entity_1.LoanCollateral),
    __metadata("design:type", Array)
], Loan.prototype, "collaterals", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Documents attached to this loan',
        type: () => [loan_document_entity_1.LoanDocument],
    }),
    (0, typeorm_1.OneToMany)(() => loan_document_entity_1.LoanDocument, (document) => document.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_document_entity_1.LoanDocument),
    __metadata("design:type", Array)
], Loan.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantors for this loan',
        type: () => [loan_guarantor_entity_1.LoanGuarantor],
    }),
    (0, typeorm_1.OneToMany)(() => loan_guarantor_entity_1.LoanGuarantor, (guarantor) => guarantor.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_guarantor_entity_1.LoanGuarantor),
    __metadata("design:type", Array)
], Loan.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Repayment schedule for this loan',
        type: () => [loan_repayment_entity_1.LoanRepayment],
    }),
    (0, typeorm_1.OneToMany)(() => loan_repayment_entity_1.LoanRepayment, (repayment) => repayment.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_repayment_entity_1.LoanRepayment),
    __metadata("design:type", Array)
], Loan.prototype, "repayments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Disbursements for this loan',
        type: () => [disbursement_entity_1.Disbursement],
    }),
    (0, typeorm_1.OneToMany)(() => disbursement_entity_1.Disbursement, (disbursement) => disbursement.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => disbursement_entity_1.Disbursement),
    __metadata("design:type", Array)
], Loan.prototype, "disbursements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Escrow accounts for this loan',
        type: () => [escrow_account_entity_1.EscrowAccount],
    }),
    (0, typeorm_1.OneToMany)(() => escrow_account_entity_1.EscrowAccount, (escrow) => escrow.loan, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => escrow_account_entity_1.EscrowAccount),
    __metadata("design:type", Array)
], Loan.prototype, "escrowAccounts", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Loan.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Loan.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Loan.prototype, "afterInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Loan.prototype, "afterUpdate", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Progress percentage (amount paid / total amount)',
        example: 42.86,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Loan.prototype, "progressPercentage", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remaining months',
        example: 24,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Loan.prototype, "remainingMonths", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is loan active',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Loan.prototype, "isActive", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is loan completed',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Loan.prototype, "isCompleted", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is loan defaulted',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Loan.prototype, "isDefaulted", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is loan approved',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Loan.prototype, "isApproved", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is loan funded',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Loan.prototype, "isFunded", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days since disbursement',
        example: 180,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Loan.prototype, "daysSinceDisbursement", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days until maturity',
        example: 365,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Loan.prototype, "daysUntilMaturity", null);
exports.Loan = Loan = __decorate([
    (0, typeorm_1.Entity)('loans'),
    (0, typeorm_1.Index)(['loanNumber'], { unique: true }),
    (0, typeorm_1.Index)(['borrowerId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['disbursementDate']),
    (0, typeorm_1.Index)(['createdAt'])
], Loan);
//# sourceMappingURL=loan.entity.js.map