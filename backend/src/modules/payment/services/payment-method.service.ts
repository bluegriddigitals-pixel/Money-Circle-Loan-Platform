import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentMethodStatus } from '../entities/payment-method.entity';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!method) {
      throw new NotFoundException('Payment method not found');
    }
    return method;
  }

  async findByUser(userId: string, includeInactive = false): Promise<PaymentMethod[]> {
    const where: any = { userId };
    if (!includeInactive) {
      where.status = { $in: [PaymentMethodStatus.ACTIVE, PaymentMethodStatus.VERIFIED] } as any;
    }
    
    return this.paymentMethodRepository.find({
      where,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async setDefault(userId: string, paymentMethodId: string): Promise<void> {
    // Remove default from all methods
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set new default
    const method = await this.findOne(paymentMethodId);
    if (method.userId !== userId) {
      throw new BadRequestException('Payment method does not belong to user');
    }
    
    method.isDefault = true;
    await this.paymentMethodRepository.save(method);
  }

  async verify(id: string, method: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    paymentMethod.verify(method);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async deactivate(id: string, reason?: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot deactivate default payment method');
    }

    paymentMethod.status = PaymentMethodStatus.INACTIVE;
    paymentMethod.metadata = {
      ...paymentMethod.metadata,
      deactivatedAt: new Date(),
      deactivationReason: reason,
    };

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async recordTransaction(id: string, amount: number): Promise<void> {
    const paymentMethod = await this.findOne(id);
    paymentMethod.recordTransaction(amount);
    await this.paymentMethodRepository.save(paymentMethod);
  }

  async getUserDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findOne({
      where: { userId, isDefault: true },
    });
  }
}