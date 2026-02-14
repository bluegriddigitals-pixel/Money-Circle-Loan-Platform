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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const transaction_enum_1 = require("../enums/transaction.enum");
let TransactionService = class TransactionService {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async create(transactionData) {
        const transaction = this.transactionRepository.create(transactionData);
        return this.transactionRepository.save(transaction);
    }
    async findOne(id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['loan', 'escrowAccount', 'paymentMethod'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async findAll(filters) {
        return this.transactionRepository.find({
            where: filters,
            relations: ['loan', 'escrowAccount', 'paymentMethod'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByLoan(loanId) {
        return this.transactionRepository.find({
            where: { loanId },
            relations: ['escrowAccount', 'paymentMethod'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByEscrow(escrowAccountId) {
        return this.transactionRepository.find({
            where: { escrowAccountId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, status) {
        const transaction = await this.findOne(id);
        transaction.status = status;
        if (status === transaction_enum_1.TransactionStatus.COMPLETED) {
            transaction.processedAt = new Date();
        }
        return this.transactionRepository.save(transaction);
    }
    async getTotalAmount(filters) {
        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where(filters)
            .getRawOne();
        return result?.total || 0;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map