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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const decimal_column_decorator_1 = require("../../../shared/decorators/decimal-column.decorator");
const loan_entity_1 = require("../../loan/entities/loan.entity");
const escrow_account_entity_1 = require("./escrow-account.entity");
const payment_method_entity_1 = require("./payment-method.entity");
const payout_request_entity_1 = require("./payout-request.entity");
const transaction_enum_1 = require("../enums/transaction.enum");
let Transaction = class Transaction {
    generateTransactionNumber() {
        if (!this.transactionNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            this.transactionNumber = `TXN-${year}-${random}`;
        }
    }
    get isCompleted() {
        return this.status === transaction_enum_1.TransactionStatus.COMPLETED;
    }
    get isPending() {
        return this.status === transaction_enum_1.TransactionStatus.PENDING;
    }
    get isFailed() {
        return this.status === transaction_enum_1.TransactionStatus.FAILED;
    }
    get isRefunded() {
        return this.status === transaction_enum_1.TransactionStatus.REFUNDED;
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the transaction',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique transaction number',
        example: 'TXN-2024-001234',
        readOnly: true,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Transaction.prototype, "transactionNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the associated loan',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the associated escrow account',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "escrowAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the payment method used',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the associated payout request',
        example: '123e4567-e89b-12d3-a456-426614174004',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "payoutRequestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User ID who initiated the transaction',
        example: '123e4567-e89b-12d3-a456-426614174005',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction type',
        enum: transaction_enum_1.TransactionType,
        example: transaction_enum_1.TransactionType.DEPOSIT,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: transaction_enum_1.TransactionType,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(transaction_enum_1.TransactionType),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction status',
        enum: transaction_enum_1.TransactionStatus,
        example: transaction_enum_1.TransactionStatus.COMPLETED,
        default: transaction_enum_1.TransactionStatus.PENDING,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: transaction_enum_1.TransactionStatus,
        default: transaction_enum_1.TransactionStatus.PENDING,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(transaction_enum_1.TransactionStatus),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount',
        example: 1000.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction currency',
        example: 'USD',
        default: 'USD',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD', nullable: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction description',
        example: 'Loan disbursement for loan #LN-2024-001',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'External transaction reference',
        example: 'ch_123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Transaction.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction fee',
        example: 25.00,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Transaction.prototype, "fee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Processing fee',
        example: 2.50,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Transaction.prototype, "processingFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax amount',
        example: 0.25,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Transaction.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Net amount (amount - fees)',
        example: 972.25,
        minimum: 0,
    }),
    (0, decimal_column_decorator_1.DecimalColumn)({ precision: 15, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Transaction.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction metadata',
        example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failure reason if transaction failed',
        example: 'Insufficient funds',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Transaction.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Processing date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Transaction.prototype, "processedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loan_entity_1.Loan, (loan) => loan.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'loanId' }),
    __metadata("design:type", loan_entity_1.Loan)
], Transaction.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => escrow_account_entity_1.EscrowAccount, (escrow) => escrow.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'escrowAccountId' }),
    __metadata("design:type", escrow_account_entity_1.EscrowAccount)
], Transaction.prototype, "escrowAccount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_method_entity_1.PaymentMethod, (paymentMethod) => paymentMethod.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'paymentMethodId' }),
    __metadata("design:type", payment_method_entity_1.PaymentMethod)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payout_request_entity_1.PayoutRequest, (payoutRequest) => payoutRequest.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'payoutRequestId' }),
    __metadata("design:type", payout_request_entity_1.PayoutRequest)
], Transaction.prototype, "payoutRequest", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "generateTransactionNumber", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is transaction completed',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Transaction.prototype, "isCompleted", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is transaction pending',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Transaction.prototype, "isPending", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is transaction failed',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Transaction.prototype, "isFailed", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is transaction refunded',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Transaction.prototype, "isRefunded", null);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['transactionNumber'], { unique: true }),
    (0, typeorm_1.Index)(['loanId']),
    (0, typeorm_1.Index)(['escrowAccountId']),
    (0, typeorm_1.Index)(['paymentMethodId']),
    (0, typeorm_1.Index)(['payoutRequestId']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map