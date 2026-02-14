import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { PaymentMethodStatus, PaymentMethodType } from '../enums/payment-method.enum';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethodData: Partial<PaymentMethod> = {
      userId: createPaymentMethodDto.userId,
      type: createPaymentMethodDto.type,
      status: PaymentMethodStatus.PENDING,
      lastFour: createPaymentMethodDto.lastFour,
      name: createPaymentMethodDto.holderName, // Map holderName to name
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

  async findOne(id: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({
      where: { id },
      relations: ['user', 'transactions'],
    });
    
    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    return method;
  }

  async findByUser(userId: string, includeInactive = false): Promise<PaymentMethod[]> {
    const where: any = { userId };
    
    if (!includeInactive) {
      where.status = In([PaymentMethodStatus.ACTIVE, PaymentMethodStatus.VERIFIED]);
    }
    
    return this.paymentMethodRepository.find({
      where,
      order: { 
        isDefault: 'DESC', 
        createdAt: 'DESC' 
      },
    });
  }

  async setDefault(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    const method = await this.findOne(paymentMethodId);
    
    if (method.userId !== userId) {
      throw new BadRequestException('Payment method does not belong to this user');
    }

    // Remove default from all other user methods
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set this as default
    method.isDefault = true;
    
    return this.paymentMethodRepository.save(method);
  }

  async verify(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    paymentMethod.status = PaymentMethodStatus.VERIFIED;
    paymentMethod.isVerified = true;
    
    // Store verification date in metadata
    paymentMethod.metadata = {
      ...paymentMethod.metadata,
      verifiedAt: new Date().toISOString(),
    };
    
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async activate(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    paymentMethod.status = PaymentMethodStatus.ACTIVE;
    
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async deactivate(id: string, reason?: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot deactivate default payment method');
    }

    paymentMethod.status = PaymentMethodStatus.INACTIVE;
    
    // Store deactivation info in metadata
    paymentMethod.metadata = {
      ...paymentMethod.metadata,
      deactivatedAt: new Date().toISOString(),
      deactivationReason: reason,
    };

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async recordTransaction(id: string, amount: number): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    // Track transaction stats in metadata
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

  async getUserDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async getVerifiedMethods(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { 
        userId, 
        status: In([PaymentMethodStatus.VERIFIED, PaymentMethodStatus.ACTIVE])
      },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    Object.assign(paymentMethod, updateData);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async delete(id: string): Promise<void> {
    const paymentMethod = await this.findOne(id);
    
    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot delete default payment method');
    }

    await this.paymentMethodRepository.softDelete(id);
  }

  async restore(id: string): Promise<PaymentMethod> {
    await this.paymentMethodRepository.restore(id);
    return this.findOne(id);
  }

  async getExpiringMethods(month: number, year: number): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: {
        expiryMonth: month,
        expiryYear: year,
        status: In([PaymentMethodStatus.ACTIVE, PaymentMethodStatus.VERIFIED]),
      },
    });
  }

  async getTransactionStats(id: string): Promise<any> {
    const paymentMethod = await this.findOne(id);
    return paymentMethod.metadata?.transactionStats || { 
      count: 0, 
      totalAmount: 0,
      lastAmount: null,
      lastTransactionDate: null
    };
  }
}