import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disbursement, DisbursementStatus } from '../entities/disbursement.entity';
import { CreateDisbursementDto } from '../dto/create-disbursement.dto';

@Injectable()
export class DisbursementService {
  constructor(
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
  ) {}

  async create(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement> {
    const disbursement = this.disbursementRepository.create(createDisbursementDto);
    return this.disbursementRepository.save(disbursement);
  }

  async findOne(id: string): Promise<Disbursement> {
    const disbursement = await this.disbursementRepository.findOne({
      where: { id },
      relations: ['loan', 'escrowAccount', 'approver', 'canceller'],
    });
    if (!disbursement) {
      throw new NotFoundException('Disbursement not found');
    }
    return disbursement;
  }

  async findByLoan(loanId: string): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: DisbursementStatus, data?: any): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    
    switch (status) {
      case DisbursementStatus.APPROVED:
        disbursement.approve(data.approvedBy, data.notes);
        break;
      case DisbursementStatus.SCHEDULED:
        disbursement.scheduleDisbursement(data.scheduledDate);
        break;
      case DisbursementStatus.FAILED:
        disbursement.fail(data.reason);
        break;
      case DisbursementStatus.CANCELLED:
        disbursement.cancel(data.cancelledBy, data.reason);
        break;
    }
    
    return this.disbursementRepository.save(disbursement);
  }

  async processDisbursement(id: string, amount?: number, transactionReference?: string): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    disbursement.disburse(amount, transactionReference);
    return this.disbursementRepository.save(disbursement);
  }

  async getScheduledDisbursements(date?: Date): Promise<Disbursement[]> {
    const queryDate = date || new Date();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.disbursementRepository.find({
      where: {
        status: DisbursementStatus.SCHEDULED,
        scheduledDate: {
          $between: [startOfDay, endOfDay],
        } as any,
      },
      relations: ['loan', 'escrowAccount'],
    });
  }

  async createSchedule(id: string, installments: Array<{ amount: number; dueDate: Date }>): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    disbursement.createSchedule(installments);
    return this.disbursementRepository.save(disbursement);
  }
}