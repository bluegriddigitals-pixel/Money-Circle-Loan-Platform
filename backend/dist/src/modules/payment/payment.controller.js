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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const create_escrow_account_dto_1 = require("./dto/create-escrow-account.dto");
const create_payout_request_dto_1 = require("./dto/create-payout-request.dto");
const process_payment_dto_1 = require("./dto/process-payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createTransaction(createTransactionDto, req) {
        const data = {
            ...createTransactionDto,
            userId: req.user.id
        };
        return this.paymentService.createTransaction(data);
    }
    async getAllTransactions(page = 1, limit = 10) {
        return this.paymentService.getAllTransactions(page, limit);
    }
    async getTransaction(id) {
        return this.paymentService.getTransaction(id);
    }
    async getUserTransactions(userId) {
        return this.paymentService.getUserTransactions(userId);
    }
    async createEscrowAccount(createEscrowAccountDto) {
        return this.paymentService.createEscrowAccount(createEscrowAccountDto);
    }
    async getEscrowAccount(id) {
        return this.paymentService.getEscrowAccount(id);
    }
    async getEscrowByLoan(loanId) {
        return this.paymentService.getEscrowByLoan(loanId);
    }
    async freezeEscrow(id, reason) {
        return this.paymentService.freezeEscrow(id, reason);
    }
    async unfreezeEscrow(id) {
        return this.paymentService.unfreezeEscrow(id);
    }
    async closeEscrow(id, reason) {
        return this.paymentService.closeEscrow(id, reason);
    }
    async processPayment(processPaymentDto, req) {
        const data = {
            ...processPaymentDto,
            userId: req.user.id
        };
        return this.paymentService.processPayment(data);
    }
    async refundPayment(transactionId, amount, reason) {
        return this.paymentService.refundPayment({
            transactionId,
            amount,
            reason,
        });
    }
    async createPayoutRequest(createPayoutRequestDto, req) {
        const data = {
            ...createPayoutRequestDto,
            userId: req.user.id
        };
        return this.paymentService.createPayoutRequest(data);
    }
    async getAllPayouts() {
        return this.paymentService.getAllPayouts();
    }
    async getUserPayouts(userId) {
        return this.paymentService.getUserPayouts(userId);
    }
    async approvePayout(id, req) {
        return this.paymentService.approvePayout(id, req.user.id);
    }
    async processPayout(id) {
        return this.paymentService.processPayoutRequest(id);
    }
    async rejectPayout(id, reason) {
        return this.paymentService.rejectPayout(id, reason);
    }
    async createPaymentMethod(data, req) {
        const paymentData = {
            ...data,
            userId: req.user.id
        };
        return this.paymentService.createPaymentMethod(paymentData);
    }
    async getUserPaymentMethods(req) {
        return this.paymentService.getUserPaymentMethods(req.user.id);
    }
    async removePaymentMethod(id, req) {
        return this.paymentService.removePaymentMethod(id, req.user.id);
    }
    async handleWebhook(provider, payload, req) {
        const signature = req.headers['stripe-signature'] || req.headers['signature'];
        return this.paymentService.handleWebhook(provider, payload, signature);
    }
    async getUserBalance(req) {
        return this.paymentService.getUserBalance(req.user.id);
    }
    async getPaymentStatistics() {
        return this.paymentService.getPaymentStatistics();
    }
    async healthCheck() {
        return this.paymentService.healthCheck();
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.AUDITOR),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.BORROWER, user_role_enum_1.UserRole.LENDER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('transactions/user/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.AUDITOR),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Post)('escrow'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_escrow_account_dto_1.CreateEscrowAccountDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createEscrowAccount", null);
__decorate([
    (0, common_1.Get)('escrow/:id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getEscrowAccount", null);
__decorate([
    (0, common_1.Get)('escrow/loan/:loanId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getEscrowByLoan", null);
__decorate([
    (0, common_1.Put)('escrow/:id/freeze'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "freezeEscrow", null);
__decorate([
    (0, common_1.Put)('escrow/:id/unfreeze'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "unfreezeEscrow", null);
__decorate([
    (0, common_1.Put)('escrow/:id/close'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "closeEscrow", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_payment_dto_1.ProcessPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)('refund/:transactionId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "refundPayment", null);
__decorate([
    (0, common_1.Post)('payouts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_request_dto_1.CreatePayoutRequestDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPayoutRequest", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.AUDITOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAllPayouts", null);
__decorate([
    (0, common_1.Get)('payouts/user/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.LENDER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getUserPayouts", null);
__decorate([
    (0, common_1.Put)('payouts/:id/approve'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "approvePayout", null);
__decorate([
    (0, common_1.Put)('payouts/:id/process'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Put)('payouts/:id/reject'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.TRANSACTION_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "rejectPayout", null);
__decorate([
    (0, common_1.Post)('methods'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.BORROWER, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentMethod", null);
__decorate([
    (0, common_1.Get)('methods'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.BORROWER, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getUserPaymentMethods", null);
__decorate([
    (0, common_1.Delete)('methods/:id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.BORROWER, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "removePaymentMethod", null);
__decorate([
    (0, common_1.Post)('webhook/:provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.BORROWER, user_role_enum_1.UserRole.LENDER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getUserBalance", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.AUDITOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentStatistics", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "healthCheck", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payment_service_1.PayoutService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map