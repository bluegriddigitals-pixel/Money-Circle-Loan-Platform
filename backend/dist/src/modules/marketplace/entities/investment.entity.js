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
exports.Investment = exports.InvestmentType = exports.InvestmentStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const user_entity_1 = require("../../user/entities/user.entity");
const loan_entity_1 = require("../../loan/entities/loan.entity");
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["PENDING"] = "pending";
    InvestmentStatus["ACTIVE"] = "active";
    InvestmentStatus["COMPLETED"] = "completed";
    InvestmentStatus["DEFAULTED"] = "defaulted";
    InvestmentStatus["CANCELLED"] = "cancelled";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
var InvestmentType;
(function (InvestmentType) {
    InvestmentType["MANUAL"] = "manual";
    InvestmentType["AUTO"] = "auto";
})(InvestmentType || (exports.InvestmentType = InvestmentType = {}));
let Investment = class Investment {
    generateInvestmentNumber() {
        if (!this.investmentNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            this.investmentNumber = `INV-${year}-${random}`;
        }
        if (this.amount && this.interestRate && this.maturityDate) {
            const months = this.getMonthDifference(new Date(this.maturityDate), new Date());
            const monthlyRate = this.interestRate / 100 / 12;
            this.expectedReturn = this.amount * Math.pow(1 + monthlyRate, months);
        }
        this.remainingBalance = this.amount - this.amountReturned;
    }
    getMonthDifference(date1, date2) {
        const years = date1.getFullYear() - date2.getFullYear();
        const months = date1.getMonth() - date2.getMonth();
        return Math.max(0, years * 12 + months);
    }
    get roi() {
        if (!this.amount || this.amount === 0)
            return 0;
        const profit = (this.amountReturned || 0) - this.amount;
        return (profit / this.amount) * 100;
    }
    get progressPercentage() {
        if (!this.amount || this.amount === 0)
            return 0;
        return (this.amountReturned / this.amount) * 100;
    }
    get isActive() {
        return this.status === InvestmentStatus.ACTIVE;
    }
    get isCompleted() {
        return this.status === InvestmentStatus.COMPLETED;
    }
    recordReturn(amount) {
        this.amountReturned += amount;
        this.remainingBalance = this.amount - this.amountReturned;
        if (this.remainingBalance <= 0) {
            this.status = InvestmentStatus.COMPLETED;
        }
    }
    cancel(reason) {
        this.status = InvestmentStatus.CANCELLED;
        this.cancelledAt = new Date();
        this.cancellationReason = reason;
    }
    toJSON() {
        return {
            id: this.id,
            investmentNumber: this.investmentNumber,
            amount: this.amount,
            currency: this.currency,
            interestRate: this.interestRate,
            status: this.status,
            type: this.type,
            investmentDate: this.investmentDate,
            maturityDate: this.maturityDate,
            expectedReturn: this.expectedReturn,
            amountReturned: this.amountReturned,
            remainingBalance: this.remainingBalance,
            roi: this.roi,
            progressPercentage: this.progressPercentage,
            isActive: this.isActive,
            isCompleted: this.isCompleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.Investment = Investment;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the investment',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Investment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique investment number',
        example: 'INV-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Investment.prototype, "investmentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investor user ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Investment.prototype, "investorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loan ID being invested in',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Investment.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investment amount',
        example: 5000.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Investment.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investment currency',
        example: 'USD',
        default: 'USD',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD', nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Investment.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Interest rate at time of investment',
        example: 12.5,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], Investment.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investment status',
        enum: InvestmentStatus,
        example: InvestmentStatus.ACTIVE,
        default: InvestmentStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvestmentStatus,
        default: InvestmentStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(InvestmentStatus),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investment type',
        enum: InvestmentType,
        example: InvestmentType.MANUAL,
        default: InvestmentType.MANUAL,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvestmentType,
        default: InvestmentType.MANUAL,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(InvestmentType),
    __metadata("design:type", String)
], Investment.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Investment date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Investment.prototype, "investmentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maturity date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Investment.prototype, "maturityDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expected return amount',
        example: 5625.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Investment.prototype, "expectedReturn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount returned so far',
        example: 1250.00,
        minimum: 0,
        default: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Investment.prototype, "amountReturned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remaining balance',
        example: 3750.00,
        minimum: 0,
        default: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Investment.prototype, "remainingBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cancellation date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Investment.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cancellation reason',
        example: 'Loan cancelled',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Investment.prototype, "cancellationReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { autoInvestRuleId: '123', riskScore: 'A' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], Investment.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Investment creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], Investment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], Investment.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], Investment.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.investments, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'investorId' }),
    __metadata("design:type", user_entity_1.User)
], Investment.prototype, "investor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.investments, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], Investment.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Investment.prototype, "generateInvestmentNumber", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Return on investment percentage',
        example: 12.5,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Investment.prototype, "roi", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Progress percentage',
        example: 25,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Investment.prototype, "progressPercentage", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is investment active',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Investment.prototype, "isActive", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is investment completed',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Investment.prototype, "isCompleted", null);
exports.Investment = Investment = __decorate([
    (0, typeorm_1.Entity)('investments'),
    (0, typeorm_1.Index)(['investmentNumber'], { unique: true }),
    (0, typeorm_1.Index)(['investorId']),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Investment);
//# sourceMappingURL=investment.entity.js.map