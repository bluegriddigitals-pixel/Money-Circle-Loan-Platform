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
exports.DisbursementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const disbursement_entity_1 = require("../entities/disbursement.entity");
const disbursement_enum_1 = require("../enums/disbursement.enum");
let DisbursementService = class DisbursementService {
    constructor(disbursementRepository) {
        this.disbursementRepository = disbursementRepository;
    }
    async create(createDisbursementDto) {
        const disbursementData = {
            ...createDisbursementDto,
            disbursementNumber: this.generateDisbursementNumber(),
            status: disbursement_enum_1.DisbursementStatus.PENDING,
            pendingAmount: createDisbursementDto.amount,
            disbursedAmount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const disbursement = this.disbursementRepository.create(disbursementData);
        const savedDisbursement = await this.disbursementRepository.save(disbursement);
        return savedDisbursement;
    }
    async findAll() {
        return this.disbursementRepository.find({
            relations: ['loan', 'escrowAccount'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount'],
        });
        if (!disbursement) {
            throw new common_1.NotFoundException(`Disbursement with ID ${id} not found`);
        }
        return disbursement;
    }
    async findByLoan(loanId) {
        return this.disbursementRepository.find({
            where: { loanId },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return this.disbursementRepository.find({
            where: { status },
            relations: ['loan', 'escrowAccount'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, status, data) {
        const disbursement = await this.findOne(id);
        disbursement.status = status;
        switch (status) {
            case disbursement_enum_1.DisbursementStatus.APPROVED:
                disbursement.approvedAt = new Date();
                disbursement.approvedBy = data?.approvedBy;
                disbursement.approvalNotes = data?.notes;
                break;
            case disbursement_enum_1.DisbursementStatus.SCHEDULED:
                disbursement.scheduledDate = data?.scheduledDate || new Date();
                break;
            case disbursement_enum_1.DisbursementStatus.FAILED:
                disbursement.failureReason = data?.reason;
                break;
            case disbursement_enum_1.DisbursementStatus.CANCELLED:
                disbursement.cancelledAt = new Date();
                disbursement.cancelledBy = data?.cancelledBy;
                disbursement.cancellationReason = data?.reason;
                break;
            case disbursement_enum_1.DisbursementStatus.PROCESSING:
                break;
        }
        disbursement.updatedAt = new Date();
        return this.disbursementRepository.save(disbursement);
    }
    async approve(id, approvedBy, notes) {
        return this.updateStatus(id, disbursement_enum_1.DisbursementStatus.APPROVED, { approvedBy, notes });
    }
    async schedule(id, scheduledDate) {
        return this.updateStatus(id, disbursement_enum_1.DisbursementStatus.SCHEDULED, { scheduledDate });
    }
    async process(id) {
        return this.updateStatus(id, disbursement_enum_1.DisbursementStatus.PROCESSING);
    }
    async complete(id, transactionReference) {
        const disbursement = await this.findOne(id);
        disbursement.status = disbursement_enum_1.DisbursementStatus.COMPLETED;
        disbursement.disbursedAt = new Date();
        disbursement.disbursedAmount = disbursement.amount;
        disbursement.pendingAmount = 0;
        if (transactionReference) {
            disbursement.transactionReference = transactionReference;
        }
        disbursement.updatedAt = new Date();
        return this.disbursementRepository.save(disbursement);
    }
    async fail(id, reason) {
        return this.updateStatus(id, disbursement_enum_1.DisbursementStatus.FAILED, { reason });
    }
    async cancel(id, cancelledBy, reason) {
        return this.updateStatus(id, disbursement_enum_1.DisbursementStatus.CANCELLED, { cancelledBy, reason });
    }
    async getScheduledDisbursements(date) {
        const queryDate = date || new Date();
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);
        return this.disbursementRepository.find({
            where: {
                status: disbursement_enum_1.DisbursementStatus.SCHEDULED,
                scheduledDate: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
            relations: ['loan', 'escrowAccount'],
            order: { scheduledDate: 'ASC' },
        });
    }
    async getPendingDisbursements() {
        return this.findByStatus(disbursement_enum_1.DisbursementStatus.PENDING);
    }
    async getApprovedDisbursements() {
        return this.findByStatus(disbursement_enum_1.DisbursementStatus.APPROVED);
    }
    async getProcessingDisbursements() {
        return this.findByStatus(disbursement_enum_1.DisbursementStatus.PROCESSING);
    }
    async getCompletedDisbursements() {
        return this.findByStatus(disbursement_enum_1.DisbursementStatus.COMPLETED);
    }
    async getFailedDisbursements() {
        return this.findByStatus(disbursement_enum_1.DisbursementStatus.FAILED);
    }
    async update(id, updateData) {
        const disbursement = await this.findOne(id);
        Object.assign(disbursement, updateData);
        disbursement.updatedAt = new Date();
        return this.disbursementRepository.save(disbursement);
    }
    async remove(id) {
        const result = await this.disbursementRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Disbursement with ID ${id} not found`);
        }
    }
    async getTotalDisbursedByLoan(loanId) {
        const result = await this.disbursementRepository
            .createQueryBuilder('disbursement')
            .select('SUM(disbursement.disbursedAmount)', 'total')
            .where('disbursement.loanId = :loanId', { loanId })
            .andWhere('disbursement.status = :status', { status: disbursement_enum_1.DisbursementStatus.COMPLETED })
            .getRawOne();
        return result?.total || 0;
    }
    async getDisbursementsByDateRange(startDate, endDate) {
        return this.disbursementRepository.find({
            where: {
                disbursedAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['loan', 'loan.borrower'],
            order: { disbursedAt: 'DESC' },
        });
    }
    async createSchedule(id, installments) {
        const disbursement = await this.findOne(id);
        const schedule = installments.map((inst, index) => ({
            ...inst,
            status: index === 0 ? 'pending' : 'scheduled',
        }));
        disbursement.schedule = schedule;
        disbursement.updatedAt = new Date();
        return this.disbursementRepository.save(disbursement);
    }
    generateDisbursementNumber() {
        const prefix = 'DISB';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
};
exports.DisbursementService = DisbursementService;
exports.DisbursementService = DisbursementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(disbursement_entity_1.Disbursement)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DisbursementService);
//# sourceMappingURL=disbursement.service.js.map