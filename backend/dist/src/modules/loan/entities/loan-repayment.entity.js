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
exports.LoanRepayment = exports.LateFeeType = exports.PaymentMethod = exports.RepaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const loan_entity_1 = require("./loan.entity");
const transaction_entity_1 = require("../../payment/entities/transaction.entity");
var RepaymentStatus;
(function (RepaymentStatus) {
    RepaymentStatus["PENDING"] = "pending";
    RepaymentStatus["DUE"] = "due";
    RepaymentStatus["PAID"] = "paid";
    RepaymentStatus["PARTIALLY_PAID"] = "partially_paid";
    RepaymentStatus["OVERDUE"] = "overdue";
    RepaymentStatus["CANCELLED"] = "cancelled";
    RepaymentStatus["WRITTEN_OFF"] = "written_off";
    RepaymentStatus["IN_COLLECTION"] = "in_collection";
})(RepaymentStatus || (exports.RepaymentStatus = RepaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["E_WALLET"] = "e_wallet";
    PaymentMethod["DIRECT_DEBIT"] = "direct_debit";
    PaymentMethod["STANDING_ORDER"] = "standing_order";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CHEQUE"] = "cheque";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var LateFeeType;
(function (LateFeeType) {
    LateFeeType["FIXED"] = "fixed";
    LateFeeType["PERCENTAGE"] = "percentage";
    LateFeeType["DAILY"] = "daily";
    LateFeeType["NONE"] = "none";
})(LateFeeType || (exports.LateFeeType = LateFeeType = {}));
let LoanRepayment = class LoanRepayment {
    get totalCharges() {
        return (this.lateFeeAmount || 0) +
            (this.penaltyInterestAmount || 0) +
            (this.otherCharges || 0);
    }
    get totalAmountDueWithCharges() {
        return this.totalAmountDue + this.totalCharges;
    }
    get paymentPercentage() {
        if (this.totalAmountDue === 0)
            return 0;
        return (this.amountPaid / this.totalAmountDue) * 100;
    }
    get isFullyPaid() {
        return this.status === RepaymentStatus.PAID;
    }
    get isPartiallyPaid() {
        return this.status === RepaymentStatus.PARTIALLY_PAID;
    }
    get isOverdue() {
        return this.status === RepaymentStatus.OVERDUE;
    }
    get isDue() {
        return this.status === RepaymentStatus.DUE;
    }
    get isPending() {
        return this.status === RepaymentStatus.PENDING;
    }
    get daysUntilDue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(this.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get isWithinGracePeriod() {
        if (!this.isOverdue)
            return false;
        const today = new Date();
        const due = new Date(this.dueDate);
        const gracePeriodEnd = new Date(due);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + this.gracePeriodDays);
        return today <= gracePeriodEnd;
    }
    get effectivePaymentDate() {
        return this.paymentDate || this.dueDate;
    }
    get principalPaid() {
        if (this.amountPaid === 0)
            return 0;
        const principalRatio = this.principalAmount / this.totalAmountDue;
        return this.amountPaid * principalRatio;
    }
    get interestPaid() {
        if (this.amountPaid === 0)
            return 0;
        const interestRatio = this.interestAmount / this.totalAmountDue;
        return this.amountPaid * interestRatio;
    }
    get chargesPaid() {
        if (this.amountPaid === 0)
            return 0;
        const principalInterestPaid = this.principalPaid + this.interestPaid;
        if (this.amountPaid <= principalInterestPaid) {
            return 0;
        }
        return Math.min(this.amountPaid - principalInterestPaid, this.totalCharges);
    }
    get isWrittenOff() {
        return this.status === RepaymentStatus.WRITTEN_OFF;
    }
    get isInCollection() {
        return this.status === RepaymentStatus.IN_COLLECTION;
    }
    get isCancelled() {
        return this.status === RepaymentStatus.CANCELLED;
    }
    async beforeInsert() {
        if (!this.repaymentNumber) {
            this.repaymentNumber = this.generateRepaymentNumber();
        }
        if (this.remainingBalance === undefined || this.remainingBalance === null) {
            this.remainingBalance = this.totalAmountDue;
        }
        this.updateStatusBasedOnDueDate();
    }
    async beforeUpdate() {
        this.version += 1;
        this.updateStatus();
        if (this.isOverdue) {
            this.calculateDaysOverdue();
        }
        if (this.isOverdue && !this.isWithinGracePeriod) {
            this.calculateCharges();
        }
    }
    async afterInsert() {
        console.log(`Loan repayment created: ${this.repaymentNumber} (${this.id})`);
    }
    async afterUpdate() {
        console.log(`Loan repayment updated: ${this.repaymentNumber} (${this.id})`);
    }
    generateRepaymentNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `REP-${new Date().getFullYear()}-${timestamp}${random}`;
    }
    updateStatusBasedOnDueDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(this.dueDate);
        due.setHours(0, 0, 0, 0);
        if (today > due && this.status === RepaymentStatus.PENDING) {
            this.status = RepaymentStatus.DUE;
        }
    }
    updateStatus() {
        if (this.amountPaid === 0) {
            if (this.status !== RepaymentStatus.OVERDUE &&
                this.status !== RepaymentStatus.DUE &&
                this.status !== RepaymentStatus.PENDING) {
                this.status = RepaymentStatus.PENDING;
            }
        }
        else if (this.amountPaid >= this.totalAmountDue) {
            this.status = RepaymentStatus.PAID;
            if (!this.paymentDate) {
                this.paymentDate = new Date();
            }
        }
        else if (this.amountPaid > 0) {
            this.status = RepaymentStatus.PARTIALLY_PAID;
        }
        if (!this.isFullyPaid && !this.isPartiallyPaid) {
            const today = new Date();
            const due = new Date(this.dueDate);
            if (today > due) {
                this.status = RepaymentStatus.OVERDUE;
            }
            else if (this.status === RepaymentStatus.OVERDUE) {
                this.status = RepaymentStatus.DUE;
            }
        }
        this.remainingBalance = Math.max(0, this.totalAmountDue - this.amountPaid);
    }
    calculateDaysOverdue() {
        if (!this.isOverdue) {
            this.daysOverdue = 0;
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(this.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        this.daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }
    calculateCharges() {
        if (this.isFullyPaid || this.daysOverdue <= this.gracePeriodDays) {
            return;
        }
        this.calculateLateFee();
        this.calculatePenaltyInterest();
    }
    calculateLateFee() {
        if (!this.lateFeeType || this.lateFeeType === LateFeeType.NONE) {
            this.lateFeeAmount = 0;
            return;
        }
        const overdueDays = Math.max(0, this.daysOverdue - this.gracePeriodDays);
        switch (this.lateFeeType) {
            case LateFeeType.FIXED:
                this.lateFeeAmount = this.lateFeeRate || 0;
                break;
            case LateFeeType.PERCENTAGE:
                const percentage = (this.lateFeeRate || 0) / 100;
                this.lateFeeAmount = this.totalAmountDue * percentage;
                break;
            case LateFeeType.DAILY:
                const dailyRate = this.lateFeeRate || 0;
                this.lateFeeAmount = dailyRate * overdueDays;
                break;
            default:
                this.lateFeeAmount = 0;
        }
    }
    calculatePenaltyInterest() {
        if (!this.penaltyInterestRate || this.penaltyInterestRate === 0) {
            this.penaltyInterestAmount = 0;
            return;
        }
        const overdueDays = Math.max(0, this.daysOverdue - this.gracePeriodDays);
        const dailyPenaltyRate = (this.penaltyInterestRate / 100) / 365;
        const overdueBalance = this.remainingBalance || this.totalAmountDue;
        this.penaltyInterestAmount = overdueBalance * dailyPenaltyRate * overdueDays;
    }
    makePayment(amount, paymentMethod, paymentReference, transactionId, notes) {
        if (amount <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }
        if (this.isFullyPaid) {
            throw new Error('Repayment is already fully paid');
        }
        if (this.isCancelled) {
            throw new Error('Cannot make payment on cancelled repayment');
        }
        if (this.isWrittenOff) {
            throw new Error('Cannot make payment on written-off repayment');
        }
        const totalDue = this.totalAmountDueWithCharges;
        if (this.amountPaid + amount > totalDue) {
            throw new Error(`Payment amount exceeds total due. Maximum payment: ${totalDue - this.amountPaid}`);
        }
        this.amountPaid += amount;
        this.paymentMethod = paymentMethod;
        this.paymentReference = paymentReference;
        this.transactionId = transactionId;
        this.paymentDate = new Date();
        if (notes) {
            this.notes = notes;
        }
        this.updateStatus();
        if (this.isOverdue && !this.isWithinGracePeriod) {
            this.calculateCharges();
        }
    }
    markAsPaid(paymentMethod, paymentReference, transactionId, notes) {
        this.makePayment(this.totalAmountDueWithCharges - this.amountPaid, paymentMethod, paymentReference, transactionId, notes);
    }
    markAsWrittenOff(reason, writeOffAmount) {
        if (this.isFullyPaid) {
            throw new Error('Cannot write off a fully paid repayment');
        }
        if (this.isCancelled) {
            throw new Error('Cannot write off a cancelled repayment');
        }
        this.writeOffReason = reason;
        this.writeOffAmount = writeOffAmount || this.remainingBalance;
        this.status = RepaymentStatus.WRITTEN_OFF;
        this.writeOffDate = new Date();
        this.remainingBalance = 0;
    }
    markAsCancelled() {
        if (this.isFullyPaid) {
            throw new Error('Cannot cancel a fully paid repayment');
        }
        if (this.isWrittenOff) {
            throw new Error('Cannot cancel a written-off repayment');
        }
        this.status = RepaymentStatus.CANCELLED;
    }
    sendToCollection(collectionAgencyId) {
        if (this.isFullyPaid) {
            throw new Error('Cannot send paid repayment to collection');
        }
        if (this.isWrittenOff) {
            throw new Error('Cannot send written-off repayment to collection');
        }
        if (this.isCancelled) {
            throw new Error('Cannot send cancelled repayment to collection');
        }
        this.collectionAgencyId = collectionAgencyId;
        this.status = RepaymentStatus.IN_COLLECTION;
        this.collectionStatus = 'assigned';
    }
    addCollectionAction(action) {
        if (!this.collectionActions) {
            this.collectionActions = [];
        }
        this.collectionActions.push(action);
        this.collectionStatus = 'in_progress';
    }
    markDisputeResolved(resolution) {
        this.isDisputed = false;
        this.disputeStatus = 'resolved';
        this.disputeResolvedDate = new Date();
        this.notes = (this.notes || '') + `\nDispute resolved: ${resolution}`;
    }
    getPaymentSummary() {
        return {
            totalDue: this.totalAmountDueWithCharges,
            amountPaid: this.amountPaid,
            remaining: this.remainingBalance,
            status: this.status,
            dueDate: this.dueDate,
        };
    }
    isPaymentLate() {
        return this.daysOverdue > 0;
    }
    getNextAction() {
        if (this.isFullyPaid) {
            return 'payment_complete';
        }
        if (this.isOverdue) {
            if (this.isWithinGracePeriod) {
                return 'send_grace_period_reminder';
            }
            else {
                return 'send_overdue_notice';
            }
        }
        if (this.isDue) {
            return 'send_due_reminder';
        }
        if (this.isPending) {
            const daysUntil = this.daysUntilDue;
            if (daysUntil <= 7) {
                return 'send_upcoming_payment_notice';
            }
        }
        return 'monitor';
    }
    toJSON() {
        const obj = { ...this };
        delete obj.internalNotes;
        delete obj.collectionAgencyId;
        delete obj.deletedAt;
        delete obj.version;
        delete obj.metadata;
        delete obj.paymentResponse;
        return obj;
    }
    toString() {
        return `LoanRepayment#${this.repaymentNumber} (${this.status})`;
    }
};
exports.LoanRepayment = LoanRepayment;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the loan repayment',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanRepayment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique repayment reference number',
        example: 'REP-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "repaymentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the loan',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanRepayment.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Installment number (e.g., 1 for first payment)',
        example: 1,
        minimum: 1,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "installmentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of installments',
        example: 24,
        minimum: 1,
    }),
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "totalInstallments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Due date for this repayment',
        example: '2024-02-15',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Principal amount due',
        example: 2000.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Interest amount due',
        example: 150.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "interestAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount due (principal + interest)',
        example: 2150.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "totalAmountDue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Late fee amount',
        example: 50.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "lateFeeAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Penalty interest amount',
        example: 25.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "penaltyInterestAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Other charges/fees',
        example: 10.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "otherCharges", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount paid',
        example: 2150.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remaining balance',
        example: 0.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "remainingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Repayment status',
        enum: RepaymentStatus,
        example: RepaymentStatus.PENDING,
        default: RepaymentStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RepaymentStatus,
        default: RepaymentStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(RepaymentStatus),
    __metadata("design:type", String)
], LoanRepayment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment date',
        example: '2024-02-15',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment method used',
        enum: PaymentMethod,
        example: PaymentMethod.BANK_TRANSFER,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], LoanRepayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment reference/transaction ID',
        example: 'TXN123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LoanRepayment.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the transaction record',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanRepayment.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment gateway response',
        example: { authorization_code: 'AUTH123', gateway_id: 'GW789' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanRepayment.prototype, "paymentResponse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Days overdue',
        example: 0,
        minimum: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "daysOverdue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Grace period in days',
        example: 7,
        minimum: 0,
        default: 7,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 7, nullable: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "gracePeriodDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Late fee type',
        enum: LateFeeType,
        example: LateFeeType.FIXED,
        default: LateFeeType.FIXED,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LateFeeType,
        default: LateFeeType.FIXED,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(LateFeeType),
    __metadata("design:type", String)
], LoanRepayment.prototype, "lateFeeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Late fee rate/amount',
        example: 50.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 10, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "lateFeeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Penalty interest rate (annual)',
        example: 5.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 5, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "penaltyInterestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collection status',
        example: 'not_started',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "collectionStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collection agency ID',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], LoanRepayment.prototype, "collectionAgencyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Collection actions taken',
        example: ['email_reminder', 'sms_reminder', 'phone_call'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LoanRepayment.prototype, "collectionActions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Write-off date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "writeOffDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Write-off reason',
        example: 'Uncollectible debt',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "writeOffReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Write-off amount',
        example: 2150.0,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanRepayment.prototype, "writeOffAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes/comments',
        example: 'Payment received via bank transfer',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
        example: 'Payment processed with 2-day delay due to bank holiday',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment confirmation number from bank',
        example: 'BANK123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "bankConfirmationNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment processor reference',
        example: 'PP123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "processorReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment settlement date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "settlementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether payment is disputed',
        example: false,
        default: false,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoanRepayment.prototype, "isDisputed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dispute resolution status',
        example: 'resolved',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRepayment.prototype, "disputeStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dispute resolution date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "disputeResolvedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Repayment creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], LoanRepayment.prototype, "deletedAt", void 0);
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
], LoanRepayment.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { customField1: 'value1', customField2: 'value2' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LoanRepayment.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan associated with this repayment',
        type: () => loan_entity_1.Loan,
    }),
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.repayments, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => loan_entity_1.Loan),
    __metadata("design:type", loan_entity_1.Loan)
], LoanRepayment.prototype, "loan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction record for this payment',
        type: () => transaction_entity_1.Transaction,
    }),
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => transaction_entity_1.Transaction),
    __metadata("design:type", transaction_entity_1.Transaction)
], LoanRepayment.prototype, "transaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total charges (late fee + penalty interest + other)',
        example: 85.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "totalCharges", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount due including charges',
        example: 2235.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "totalAmountDueWithCharges", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment percentage',
        example: 100.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "paymentPercentage", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is fully paid',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isFullyPaid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is partially paid',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isPartiallyPaid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is overdue',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isOverdue", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is due',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isDue", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is pending',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isPending", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days until due date (negative if overdue)',
        example: 5,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "daysUntilDue", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether payment is within grace period',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isWithinGracePeriod", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Effective payment date (payment date or due date if not paid)',
        example: '2024-02-15',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "effectivePaymentDate", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Principal paid amount',
        example: 2000.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "principalPaid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Interest paid amount',
        example: 150.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "interestPaid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Charges paid amount',
        example: 0.0,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "chargesPaid", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether repayment is written off',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isWrittenOff", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether repayment is in collection',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isInCollection", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether repayment is cancelled',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanRepayment.prototype, "isCancelled", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanRepayment.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanRepayment.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanRepayment.prototype, "afterInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanRepayment.prototype, "afterUpdate", null);
exports.LoanRepayment = LoanRepayment = __decorate([
    (0, typeorm_1.Entity)('loan_repayments'),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['dueDate']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['installmentNumber']),
    (0, typeorm_1.Index)(['transactionId'], { unique: true, where: 'transaction_id IS NOT NULL' }),
    (0, typeorm_1.Index)(['paymentDate'])
], LoanRepayment);
//# sourceMappingURL=loan-repayment.entity.js.map