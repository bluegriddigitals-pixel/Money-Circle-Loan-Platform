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
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const risk_assessment_entity_1 = require("./entities/risk-assessment.entity");
let RiskService = class RiskService {
    constructor(riskRepository) {
        this.riskRepository = riskRepository;
    }
    async createAssessment(createRiskDto) {
        const assessment = this.riskRepository.create(createRiskDto);
        const saved = await this.riskRepository.save(assessment);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async findAll() {
        return await this.riskRepository.find({
            relations: ['user', 'loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const assessment = await this.riskRepository.findOne({
            where: { id },
            relations: ['user', 'loan', 'riskFactors'],
        });
        if (!assessment) {
            throw new common_1.NotFoundException(`Risk assessment with ID ${id} not found`);
        }
        return assessment;
    }
    async findByUser(userId) {
        return await this.riskRepository.find({
            where: { userId },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateRiskDto) {
        await this.riskRepository.update(id, updateRiskDto);
        const updated = await this.riskRepository.findOne({
            where: { id },
            relations: ['user', 'loan', 'riskFactors'],
        });
        if (!updated) {
            throw new common_1.NotFoundException(`Risk assessment with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id) {
        const result = await this.riskRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Risk assessment with ID ${id} not found`);
        }
    }
    async calculateRiskScore(userId, loanAmount) {
        return 75;
    }
    async performInitialRiskAssessment(user, registerDto) {
        return { riskLevel: 'LOW', factors: [] };
    }
    async calculateInitialCreditScore(user, registerDto) {
        return 500;
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(risk_assessment_entity_1.RiskAssessment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RiskService);
//# sourceMappingURL=risk.service.js.map