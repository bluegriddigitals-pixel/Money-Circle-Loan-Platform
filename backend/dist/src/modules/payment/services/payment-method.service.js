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
exports.PaymentMethodService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_method_entity_1 = require("../entities/payment-method.entity");
const payment_method_enum_1 = require("../enums/payment-method.enum");
let PaymentMethodService = class PaymentMethodService {
    constructor(paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }
    async create(createPaymentMethodDto) {
        const paymentMethodData = {
            userId: createPaymentMethodDto.userId,
            type: createPaymentMethodDto.type,
            status: payment_method_enum_1.PaymentMethodStatus.PENDING,
            lastFour: createPaymentMethodDto.lastFour,
            name: createPaymentMethodDto.holderName,
            bankName: createPaymentMethodDto.bankName,
            gatewayToken: createPaymentMethodDto.gatewayToken,
            gatewayCustomerId: createPaymentMethodDto.gatewayCustomerId,
            billingAddress: createPaymentMethodDto.billingAddress,
            isDefault: createPaymentMethodDto.isDefault || false,
            isVerified: false,
            metadata: createPaymentMethodDto.metadata || {},
            expiryMonth: createPaymentMethodDto.expiryMonth,
            expiryYear: createPaymentMethodDto.expiryYear,
        };
        const paymentMethod = this.paymentMethodRepository.create(paymentMethodData);
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async findOne(id) {
        const method = await this.paymentMethodRepository.findOne({
            where: { id },
            relations: ['user', 'transactions'],
        });
        if (!method) {
            throw new common_1.NotFoundException(`Payment method with ID ${id} not found`);
        }
        return method;
    }
    async findByUser(userId, includeInactive = false) {
        const where = { userId };
        if (!includeInactive) {
            where.status = (0, typeorm_2.In)([payment_method_enum_1.PaymentMethodStatus.ACTIVE, payment_method_enum_1.PaymentMethodStatus.VERIFIED]);
        }
        return this.paymentMethodRepository.find({
            where,
            order: {
                isDefault: 'DESC',
                createdAt: 'DESC'
            },
        });
    }
    async setDefault(userId, paymentMethodId) {
        const method = await this.findOne(paymentMethodId);
        if (method.userId !== userId) {
            throw new common_1.BadRequestException('Payment method does not belong to this user');
        }
        await this.paymentMethodRepository.update({ userId, isDefault: true }, { isDefault: false });
        method.isDefault = true;
        return this.paymentMethodRepository.save(method);
    }
    async verify(id) {
        const paymentMethod = await this.findOne(id);
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.VERIFIED;
        paymentMethod.isVerified = true;
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            verifiedAt: new Date().toISOString(),
        };
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async activate(id) {
        const paymentMethod = await this.findOne(id);
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.ACTIVE;
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async deactivate(id, reason) {
        const paymentMethod = await this.findOne(id);
        if (paymentMethod.isDefault) {
            throw new common_1.BadRequestException('Cannot deactivate default payment method');
        }
        paymentMethod.status = payment_method_enum_1.PaymentMethodStatus.INACTIVE;
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            deactivatedAt: new Date().toISOString(),
            deactivationReason: reason,
        };
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async recordTransaction(id, amount) {
        const paymentMethod = await this.findOne(id);
        const currentStats = paymentMethod.metadata?.transactionStats || {
            count: 0,
            totalAmount: 0,
        };
        paymentMethod.metadata = {
            ...paymentMethod.metadata,
            transactionStats: {
                count: (currentStats.count || 0) + 1,
                totalAmount: (currentStats.totalAmount || 0) + amount,
                lastAmount: amount,
                lastTransactionDate: new Date().toISOString()
            }
        };
        paymentMethod.lastUsedAt = new Date();
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async getUserDefaultPaymentMethod(userId) {
        return this.paymentMethodRepository.findOne({
            where: { userId, isDefault: true },
        });
    }
    async getVerifiedMethods(userId) {
        return this.paymentMethodRepository.find({
            where: {
                userId,
                status: (0, typeorm_2.In)([payment_method_enum_1.PaymentMethodStatus.VERIFIED, payment_method_enum_1.PaymentMethodStatus.ACTIVE])
            },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }
    async update(id, updateData) {
        const paymentMethod = await this.findOne(id);
        Object.assign(paymentMethod, updateData);
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async delete(id) {
        const paymentMethod = await this.findOne(id);
        if (paymentMethod.isDefault) {
            throw new common_1.BadRequestException('Cannot delete default payment method');
        }
        await this.paymentMethodRepository.softDelete(id);
    }
    async restore(id) {
        await this.paymentMethodRepository.restore(id);
        return this.findOne(id);
    }
    async getExpiringMethods(month, year) {
        return this.paymentMethodRepository.find({
            where: {
                expiryMonth: month,
                expiryYear: year,
                status: (0, typeorm_2.In)([payment_method_enum_1.PaymentMethodStatus.ACTIVE, payment_method_enum_1.PaymentMethodStatus.VERIFIED]),
            },
        });
    }
    async getTransactionStats(id) {
        const paymentMethod = await this.findOne(id);
        return paymentMethod.metadata?.transactionStats || {
            count: 0,
            totalAmount: 0,
            lastAmount: null,
            lastTransactionDate: null
        };
    }
};
exports.PaymentMethodService = PaymentMethodService;
exports.PaymentMethodService = PaymentMethodService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_method_entity_1.PaymentMethod)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentMethodService);
//# sourceMappingURL=payment-method.service.js.map