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
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const investment_entity_1 = require("./entities/investment.entity");
let MarketplaceService = class MarketplaceService {
    constructor(investmentRepository) {
        this.investmentRepository = investmentRepository;
    }
    async createInvestment(investmentData) {
        const investment = this.investmentRepository.create(investmentData);
        return this.investmentRepository.save(investment);
    }
    async getInvestment(id) {
        const investment = await this.investmentRepository.findOne({
            where: { id },
            relations: ['investor', 'loan'],
        });
        if (!investment) {
            throw new common_1.NotFoundException(`Investment with ID ${id} not found`);
        }
        return investment;
    }
    async getInvestmentsByInvestor(investorId) {
        return this.investmentRepository.find({
            where: { investorId },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async getInvestmentsByLoan(loanId) {
        return this.investmentRepository.find({
            where: { loanId },
            relations: ['investor'],
            order: { createdAt: 'DESC' },
        });
    }
    async getActiveInvestments(investorId) {
        const query = this.investmentRepository.createQueryBuilder('investment')
            .where('investment.status = :status', { status: investment_entity_1.InvestmentStatus.ACTIVE });
        if (investorId) {
            query.andWhere('investment.investorId = :investorId', { investorId });
        }
        query.orderBy('investment.createdAt', 'DESC');
        return query.getMany();
    }
    async updateInvestmentStatus(id, status) {
        const investment = await this.getInvestment(id);
        investment.status = status;
        return this.investmentRepository.save(investment);
    }
    async recordReturn(investmentId, amount) {
        const investment = await this.getInvestment(investmentId);
        investment.recordReturn(amount);
        return this.investmentRepository.save(investment);
    }
    async cancelInvestment(id, reason) {
        const investment = await this.getInvestment(id);
        investment.cancel(reason);
        return this.investmentRepository.save(investment);
    }
    async getInvestmentStatistics() {
        const [totalInvestments, totalActive, totalCompleted,] = await Promise.all([
            this.investmentRepository.count(),
            this.investmentRepository.count({ where: { status: investment_entity_1.InvestmentStatus.ACTIVE } }),
            this.investmentRepository.count({ where: { status: investment_entity_1.InvestmentStatus.COMPLETED } }),
        ]);
        const amountResult = await this.investmentRepository
            .createQueryBuilder('investment')
            .select('SUM(investment.amount)', 'total')
            .getRawOne();
        const returnedResult = await this.investmentRepository
            .createQueryBuilder('investment')
            .select('SUM(investment.amountReturned)', 'total')
            .getRawOne();
        const roiResult = await this.investmentRepository
            .createQueryBuilder('investment')
            .select('AVG((investment.amountReturned - investment.amount) / investment.amount * 100)', 'avg')
            .where('investment.status = :status', { status: investment_entity_1.InvestmentStatus.COMPLETED })
            .getRawOne();
        return {
            totalInvestments,
            totalActive,
            totalCompleted,
            totalAmount: parseFloat(amountResult?.total || '0'),
            totalReturned: parseFloat(returnedResult?.total || '0'),
            averageRoi: parseFloat(roiResult?.avg || '0'),
        };
    }
    async getInvestorSummary(investorId) {
        const investments = await this.getInvestmentsByInvestor(investorId);
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalReturned = investments.reduce((sum, inv) => sum + inv.amountReturned, 0);
        const activeInvestments = investments.filter(inv => inv.isActive).length;
        const completedInvestments = investments.filter(inv => inv.isCompleted).length;
        const roi = totalInvested > 0 ? ((totalReturned - totalInvested) / totalInvested) * 100 : 0;
        return {
            totalInvested,
            totalReturned,
            activeInvestments,
            completedInvestments,
            roi,
        };
    }
    async getAvailableLoansForInvestment(filters) {
        void filters;
        return [];
    }
    async calculateInvestmentProjection(amount, interestRate, termMonths) {
        const monthlyRate = interestRate / 100 / 12;
        const totalReturn = amount * Math.pow(1 + monthlyRate, termMonths);
        const profit = totalReturn - amount;
        const monthlyReturn = profit / termMonths;
        return {
            totalReturn,
            profit,
            monthlyReturn,
        };
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(investment_entity_1.Investment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map