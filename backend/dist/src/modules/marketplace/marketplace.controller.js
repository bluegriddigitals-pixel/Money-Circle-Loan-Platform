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
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const marketplace_service_1 = require("./marketplace.service");
let MarketplaceController = class MarketplaceController {
    constructor(marketplaceService) {
        this.marketplaceService = marketplaceService;
    }
    async createInvestment(createInvestmentDto) {
        return this.marketplaceService.createInvestment(createInvestmentDto);
    }
    async getInvestment(id) {
        return this.marketplaceService.getInvestment(id);
    }
    async getInvestmentsByInvestor(investorId) {
        return this.marketplaceService.getInvestmentsByInvestor(investorId);
    }
    async getInvestmentsByLoan(loanId) {
        return this.marketplaceService.getInvestmentsByLoan(loanId);
    }
    async getActiveInvestments(investorId) {
        return this.marketplaceService.getActiveInvestments(investorId);
    }
    async updateInvestmentStatus(id, status) {
        return this.marketplaceService.updateInvestmentStatus(id, status);
    }
    async recordReturn(id, amount) {
        return this.marketplaceService.recordReturn(id, amount);
    }
    async cancelInvestment(id, reason) {
        return this.marketplaceService.cancelInvestment(id, reason);
    }
    async getInvestmentStatistics() {
        return this.marketplaceService.getInvestmentStatistics();
    }
    async getInvestorSummary(investorId) {
        return this.marketplaceService.getInvestorSummary(investorId);
    }
    async getAvailableLoans(filters) {
        return this.marketplaceService.getAvailableLoansForInvestment(filters);
    }
    async calculateProjection(amount, interestRate, termMonths) {
        return this.marketplaceService.calculateInvestmentProjection(amount, interestRate, termMonths);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Post)('investments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new investment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Investment created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createInvestment", null);
__decorate([
    (0, common_1.Get)('investments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getInvestment", null);
__decorate([
    (0, common_1.Get)('investors/:investorId/investments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investments by investor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investments' }),
    __param(0, (0, common_1.Param)('investorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getInvestmentsByInvestor", null);
__decorate([
    (0, common_1.Get)('loans/:loanId/investments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investments by loan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investments' }),
    __param(0, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getInvestmentsByLoan", null);
__decorate([
    (0, common_1.Get)('investors/:investorId/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active investments for investor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return active investments' }),
    __param(0, (0, common_1.Param)('investorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getActiveInvestments", null);
__decorate([
    (0, common_1.Patch)('investments/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update investment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment status updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "updateInvestmentStatus", null);
__decorate([
    (0, common_1.Post)('investments/:id/returns'),
    (0, swagger_1.ApiOperation)({ summary: 'Record return on investment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return recorded successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "recordReturn", null);
__decorate([
    (0, common_1.Patch)('investments/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel investment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment cancelled' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "cancelInvestment", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investment statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investment statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getInvestmentStatistics", null);
__decorate([
    (0, common_1.Get)('investors/:investorId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investor summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investor summary' }),
    __param(0, (0, common_1.Param)('investorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getInvestorSummary", null);
__decorate([
    (0, common_1.Get)('loans/available'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available loans for investment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return available loans' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getAvailableLoans", null);
__decorate([
    (0, common_1.Get)('projections'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate investment projection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return investment projection' }),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('interestRate')),
    __param(2, (0, common_1.Query)('termMonths')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "calculateProjection", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, swagger_1.ApiTags)('marketplace'),
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map