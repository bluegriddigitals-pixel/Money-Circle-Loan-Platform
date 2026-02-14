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
exports.LoanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const loan_service_1 = require("./loan.service");
const create_loan_dto_1 = require("./dto/create-loan.dto");
const update_loan_dto_1 = require("./dto/update-loan.dto");
const loan_response_dto_1 = require("./dto/loan-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const loan_entity_1 = require("./entities/loan.entity");
let LoanController = class LoanController {
    constructor(loanService) {
        this.loanService = loanService;
    }
    async create(createLoanDto, req) {
        return this.loanService.create(createLoanDto, req.user.id);
    }
    async findAll(page, limit, status, userId, minAmount, maxAmount, startDate, endDate) {
        const filters = { status, userId, minAmount, maxAmount, startDate, endDate };
        return this.loanService.findAllWithFilters(filters, page, limit);
    }
    async findMyLoans(req) {
        return this.loanService.findByUser(req.user.id);
    }
    async findAvailableLoans() {
        return this.loanService.findAvailableLoans();
    }
    async getStats() {
        return this.loanService.getLoanStats();
    }
    async findOne(id, req) {
        return this.loanService.findOne(id, req.user);
    }
    async getRepaymentSchedule(id) {
        return this.loanService.calculateRepaymentSchedule(id);
    }
    async update(id, updateLoanDto, req) {
        return this.loanService.update(id, updateLoanDto, req.user);
    }
    async updateStatus(id, status, reason, req) {
        return this.loanService.updateLoanStatus(id, status, reason, req.user.id);
    }
    async approve(id, req) {
        return this.loanService.approveLoan(id, req.user.id);
    }
    async reject(id, reason, req) {
        return this.loanService.rejectLoan(id, reason, req.user.id);
    }
    async disburse(id, req) {
        return this.loanService.disburseLoan(id, req.user.id);
    }
    async complete(id, req) {
        return this.loanService.completeLoan(id, req.user.id);
    }
    async default(id, reason, req) {
        return this.loanService.defaultLoan(id, reason, req.user.id);
    }
    async remove(id) {
        return this.loanService.remove(id);
    }
};
exports.LoanController = LoanController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.BORROWER, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new loan application' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Loan created successfully', type: loan_response_dto_1.LoanResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_loan_dto_1.CreateLoanDto, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AUDITOR, user_entity_1.UserRole.LENDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all loans with pagination and filters' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: loan_entity_1.LoanStatus, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: 'Filter by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'minAmount', required: false, type: Number, description: 'Minimum loan amount' }),
    (0, swagger_1.ApiQuery)({ name: 'maxAmount', required: false, type: Number, description: 'Maximum loan amount' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Start date filter' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'End date filter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all loans', type: [loan_response_dto_1.LoanResponseDto] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('minAmount')),
    __param(5, (0, common_1.Query)('maxAmount')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-loans'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.BORROWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user loans' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return user loans', type: [loan_response_dto_1.LoanResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "findMyLoans", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.LENDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get available loans for investment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return available loans', type: [loan_response_dto_1.LoanResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "findAvailableLoans", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get loan statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return loan statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AUDITOR, user_entity_1.UserRole.BORROWER, user_entity_1.UserRole.LENDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get loan by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return loan', type: loan_response_dto_1.LoanResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Loan not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/repayment-schedule'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.BORROWER, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get loan repayment schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return repayment schedule' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getRepaymentSchedule", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.BORROWER, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update loan' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Loan updated', type: loan_response_dto_1.LoanResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_loan_dto_1.UpdateLoanDto, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.COMPLIANCE_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Update loan status' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Loan status updated' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.COMPLIANCE_OFFICER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve loan' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.COMPLIANCE_OFFICER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject loan' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/disburse'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TRANSACTION_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Disburse loan' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "disburse", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.BORROWER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark loan as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/default'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.COMPLIANCE_OFFICER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark loan as defaulted' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "default", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete loan' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Loan ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Loan deleted' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "remove", null);
exports.LoanController = LoanController = __decorate([
    (0, swagger_1.ApiTags)('loans'),
    (0, common_1.Controller)('loans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [loan_service_1.LoanService])
], LoanController);
//# sourceMappingURL=loan.controller.js.map