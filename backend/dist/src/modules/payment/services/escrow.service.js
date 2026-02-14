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
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const escrow_account_entity_1 = require("../entities/escrow-account.entity");
const escrow_enum_1 = require("../enums/escrow.enum");
let EscrowService = class EscrowService {
    constructor(escrowRepository) {
        this.escrowRepository = escrowRepository;
    }
    async create(createEscrowAccountDto) {
        const escrowData = {
            ...createEscrowAccountDto,
            accountNumber: this.generateAccountNumber(),
            status: escrow_enum_1.EscrowAccountStatus.PENDING,
            currentBalance: 0,
            availableBalance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const escrowAccount = this.escrowRepository.create(escrowData);
        return this.escrowRepository.save(escrowAccount);
    }
    async findAll() {
        return this.escrowRepository.find({
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const escrow = await this.escrowRepository.findOne({
            where: { id },
            relations: ['loan', 'transactions'],
        });
        if (!escrow) {
            throw new common_1.NotFoundException(`Escrow account with ID ${id} not found`);
        }
        return escrow;
    }
    async findByLoan(loanId) {
        return this.escrowRepository.find({
            where: { loanId },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return this.escrowRepository.find({
            where: { status },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByType(type) {
        return this.escrowRepository.find({
            where: { type },
            relations: ['loan'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateBalance(id, amount, type) {
        const escrow = await this.findOne(id);
        if (escrow.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
            throw new common_1.BadRequestException('Escrow account is not active');
        }
        const currentBalance = Number(escrow.currentBalance);
        const availableBalance = Number(escrow.availableBalance);
        const maxBalance = escrow.maximumBalance ? Number(escrow.maximumBalance) : null;
        if (type === 'credit') {
            if (maxBalance && (currentBalance + amount) > maxBalance) {
                throw new common_1.BadRequestException(`Would exceed maximum balance of ${maxBalance}`);
            }
            escrow.currentBalance = currentBalance + amount;
            escrow.availableBalance = availableBalance + amount;
        }
        else {
            if (amount > availableBalance) {
                throw new common_1.BadRequestException(`Insufficient available balance. Available: ${availableBalance}, Requested: ${amount}`);
            }
            escrow.currentBalance = currentBalance - amount;
            escrow.availableBalance = availableBalance - amount;
        }
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async reserveFunds(id, amount) {
        const escrow = await this.findOne(id);
        if (escrow.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
            throw new common_1.BadRequestException('Escrow account is not active');
        }
        if (amount > Number(escrow.availableBalance)) {
            throw new common_1.BadRequestException(`Insufficient available balance. Available: ${escrow.availableBalance}, Requested: ${amount}`);
        }
        escrow.availableBalance = Number(escrow.availableBalance) - amount;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async releaseReservedFunds(id, amount) {
        const escrow = await this.findOne(id);
        if (escrow.status !== escrow_enum_1.EscrowAccountStatus.ACTIVE) {
            throw new common_1.BadRequestException('Escrow account is not active');
        }
        escrow.availableBalance = Number(escrow.availableBalance) + amount;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async freeze(id, reason) {
        const escrow = await this.findOne(id);
        escrow.status = escrow_enum_1.EscrowAccountStatus.FROZEN;
        escrow.frozenReason = reason;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async unfreeze(id) {
        const escrow = await this.findOne(id);
        escrow.status = escrow_enum_1.EscrowAccountStatus.ACTIVE;
        escrow.frozenReason = null;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async close(id, reason) {
        const escrow = await this.findOne(id);
        if (Number(escrow.currentBalance) > 0) {
            throw new common_1.BadRequestException('Cannot close escrow account with positive balance');
        }
        escrow.status = escrow_enum_1.EscrowAccountStatus.CLOSED;
        escrow.closedReason = reason;
        escrow.closedAt = new Date();
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async release(id, releasedTo) {
        const escrow = await this.findOne(id);
        escrow.releasedAt = new Date();
        escrow.releasedTo = releasedTo;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async activate(id) {
        const escrow = await this.findOne(id);
        escrow.status = escrow_enum_1.EscrowAccountStatus.ACTIVE;
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async getTotalBalance(loanId) {
        const query = this.escrowRepository.createQueryBuilder('escrow')
            .select('SUM(escrow.currentBalance)', 'currentTotal')
            .addSelect('SUM(escrow.availableBalance)', 'availableTotal');
        if (loanId) {
            query.where('escrow.loanId = :loanId', { loanId });
        }
        const result = await query.getRawOne();
        return {
            current: Number(result?.currentTotal) || 0,
            available: Number(result?.availableTotal) || 0,
        };
    }
    async update(id, updateData) {
        const escrow = await this.findOne(id);
        Object.assign(escrow, updateData);
        escrow.updatedAt = new Date();
        return this.escrowRepository.save(escrow);
    }
    async remove(id) {
        const result = await this.escrowRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Escrow account with ID ${id} not found`);
        }
    }
    async getAccountSummary(id) {
        const escrow = await this.findOne(id);
        return {
            id: escrow.id,
            accountNumber: escrow.accountNumber,
            type: escrow.type,
            status: escrow.status,
            currentBalance: escrow.currentBalance,
            availableBalance: escrow.availableBalance,
            loanId: escrow.loanId,
            createdAt: escrow.createdAt,
            updatedAt: escrow.updatedAt,
        };
    }
    async getActiveAccounts() {
        return this.findByStatus(escrow_enum_1.EscrowAccountStatus.ACTIVE);
    }
    async getFrozenAccounts() {
        return this.findByStatus(escrow_enum_1.EscrowAccountStatus.FROZEN);
    }
    async getClosedAccounts() {
        return this.findByStatus(escrow_enum_1.EscrowAccountStatus.CLOSED);
    }
    async getPendingAccounts() {
        return this.findByStatus(escrow_enum_1.EscrowAccountStatus.PENDING);
    }
    generateAccountNumber() {
        const prefix = 'ESC';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(escrow_account_entity_1.EscrowAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map