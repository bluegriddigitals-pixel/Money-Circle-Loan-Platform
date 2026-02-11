import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest, PayoutRequestStatus } from '../entities/payout-request.entity';
import { CreatePayoutRequestDto } from '../dto/create-payout-request.dto';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(PayoutRequest)
    private readonly payoutRepository: Repository<PayoutRequest>,
  ) {}

  async create(createPayoutRequestDto: CreatePayoutRequestDto): Promise<PayoutRequest> {
    const payoutRequest = this.payoutRepository.create(createPayoutRequestDto);
    return this.payoutRepository.save(payoutRequest);
  }

  async findOne(id: string): Promise<PayoutRequest> {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: ['user', 'escrowAccount'],
    });
    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }
    return payout;
  }

  async findByUser(userId: string): Promise<PayoutRequest[]> {
    return this.payoutRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: PayoutRequestStatus, data?: any): Promise<PayoutRequest> {
    const payout = await this.findOne(id);
    
    switch (status) {
      case PayoutRequestStatus.APPROVED:
        payout.approve(data.approvedBy, data.notes);
        break;
      case PayoutRequestStatus.REJECTED:
        payout.reject(data.rejectedBy, data.reason);
        break;
      case PayoutRequestStatus.PROCESSING:
        payout.startProcessing();
        break;
      case PayoutRequestStatus.COMPLETED:
        payout.complete(data.transactionReference);
        break;
      case PayoutRequestStatus.FAILED:
        payout.fail(data.reason);
        break;
      case PayoutRequestStatus.CANCELLED:
        payout.cancel(data.cancelledBy, data.reason);
        break;
    }
    
    return this.payoutRepository.save(payout);
  }

  async getPendingPayouts(limit = 100): Promise<PayoutRequest[]> {
    return this.payoutRepository.find({
      where: { status: PayoutRequestStatus.APPROVED },
      take: limit,
      order: { approvedAt: 'ASC' },
    });
  }

  async getUserPayoutSummary(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    totalAmount: number;
  }> {
    const payouts = await this.payoutRepository.find({
      where: { userId },
    });

    return {
      total: payouts.length,
      pending: payouts.filter(p => p.isPending || p.isApproved).length,
      completed: payouts.filter(p => p.isCompleted).length,
      totalAmount: payouts.reduce((sum, p) => sum + (p.isCompleted ? p.amount : 0), 0),
    };
  }
}