import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PaymentMethod, PaymentMethodStatus } from '../entities/payment-method.entity';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Create a new payment method instance
    const paymentMethod = new PaymentMethod();
    
    // Only assign properties that exist in the entity
    paymentMethod.userId = createPaymentMethodDto.userId;
    paymentMethod.type = createPaymentMethodDto.type as any; // ✅ Type assertion to fix enum mismatch
    paymentMethod.lastFour = createPaymentMethodDto.lastFour;
    paymentMethod.name = createPaymentMethodDto.holderName; // Entity uses 'name', DTO uses 'holderName'
    paymentMethod.bankName = createPaymentMethodDto.bankName;
    paymentMethod.gatewayToken = createPaymentMethodDto.gatewayToken;
    paymentMethod.gatewayCustomerId = createPaymentMethodDto.gatewayCustomerId;
    paymentMethod.billingAddress = createPaymentMethodDto.billingAddress;
    paymentMethod.isDefault = createPaymentMethodDto.isDefault || false;
    paymentMethod.metadata = createPaymentMethodDto.metadata;
    paymentMethod.expiryMonth = createPaymentMethodDto.expiryMonth;
    paymentMethod.expiryYear = createPaymentMethodDto.expiryYear;
    
    // Set initial status
    paymentMethod.status = PaymentMethodStatus.PENDING;
    paymentMethod.isVerified = false;

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({
      where: { id },
      relations: ['user'],
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

  async setDefault(userId: string, paymentMethodId: string): Promise<void> {
    // First, verify the payment method exists and belongs to the user
    const method = await this.findOne(paymentMethodId);
    
    if (method.userId !== userId) {
      throw new BadRequestException('Payment method does not belong to this user');
    }

    // Remove default from all user's payment methods
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set the new default
    method.isDefault = true;
    await this.paymentMethodRepository.save(method);
  }

  async verify(id: string, verificationMethod: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    paymentMethod.verify(verificationMethod);
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

  async delete(id: string): Promise<void> {
    const paymentMethod = await this.findOne(id);
    
    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot delete default payment method');
    }

    await this.paymentMethodRepository.softRemove(paymentMethod);
  }

  async restore(id: string): Promise<PaymentMethod> {
    await this.paymentMethodRepository.restore(id);
    return this.findOne(id);
  }
}