import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Disbursement } from '../entities/disbursement.entity';
import { DisbursementStatus } from '../enums/disbursement.enum';
import { CreateDisbursementDto } from '../dto/create-disbursement.dto';

@Injectable()
export class DisbursementService {
  constructor(
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
  ) {}

  async create(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement> {
    const disbursementData: Partial<Disbursement> = {
      ...createDisbursementDto,
      disbursementNumber: this.generateDisbursementNumber(),
      status: DisbursementStatus.PENDING,
      pendingAmount: createDisbursementDto.amount,
      disbursedAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const disbursement = this.disbursementRepository.create(disbursementData);
    const savedDisbursement = await this.disbursementRepository.save(disbursement);
    return savedDisbursement;
  }

  async findAll(): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      relations: ['loan', 'escrowAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Disbursement> {
    const disbursement = await this.disbursementRepository.findOne({
      where: { id },
      relations: ['loan', 'escrowAccount'],
    });
    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }
    return disbursement;
  }

  async findByLoan(loanId: string): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      where: { loanId },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: DisbursementStatus): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      where: { status },
      relations: ['loan', 'escrowAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: DisbursementStatus, data?: any): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    
    disbursement.status = status;
    
    switch (status) {
      case DisbursementStatus.APPROVED:
        disbursement.approvedAt = new Date();
        disbursement.approvedBy = data?.approvedBy;
        disbursement.approvalNotes = data?.notes;
        break;
      case DisbursementStatus.SCHEDULED:
        disbursement.scheduledDate = data?.scheduledDate || new Date();
        break;
      case DisbursementStatus.FAILED:
        disbursement.failureReason = data?.reason;
        break;
      case DisbursementStatus.CANCELLED:
        disbursement.cancelledAt = new Date();
        disbursement.cancelledBy = data?.cancelledBy;
        disbursement.cancellationReason = data?.reason;
        break;
      case DisbursementStatus.PROCESSING:
        // Just status change, no additional fields
        break;
    }
    
    disbursement.updatedAt = new Date();
    return this.disbursementRepository.save(disbursement);
  }

  async approve(id: string, approvedBy: string, notes?: string): Promise<Disbursement> {
    return this.updateStatus(id, DisbursementStatus.APPROVED, { approvedBy, notes });
  }

  async schedule(id: string, scheduledDate: Date): Promise<Disbursement> {
    return this.updateStatus(id, DisbursementStatus.SCHEDULED, { scheduledDate });
  }

  async process(id: string): Promise<Disbursement> {
    return this.updateStatus(id, DisbursementStatus.PROCESSING);
  }

  async complete(id: string, transactionReference?: string): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    
    disbursement.status = DisbursementStatus.COMPLETED;
    disbursement.disbursedAt = new Date();
    disbursement.disbursedAmount = disbursement.amount;
    disbursement.pendingAmount = 0;
    if (transactionReference) {
      disbursement.transactionReference = transactionReference;
    }
    disbursement.updatedAt = new Date();
    
    return this.disbursementRepository.save(disbursement);
  }

  async fail(id: string, reason: string): Promise<Disbursement> {
    return this.updateStatus(id, DisbursementStatus.FAILED, { reason });
  }

  async cancel(id: string, cancelledBy: string, reason: string): Promise<Disbursement> {
    return this.updateStatus(id, DisbursementStatus.CANCELLED, { cancelledBy, reason });
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
        scheduledDate: Between(startOfDay, endOfDay),
      },
      relations: ['loan', 'escrowAccount'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getPendingDisbursements(): Promise<Disbursement[]> {
    return this.findByStatus(DisbursementStatus.PENDING);
  }

  async getApprovedDisbursements(): Promise<Disbursement[]> {
    return this.findByStatus(DisbursementStatus.APPROVED);
  }

  async getProcessingDisbursements(): Promise<Disbursement[]> {
    return this.findByStatus(DisbursementStatus.PROCESSING);
  }

  async getCompletedDisbursements(): Promise<Disbursement[]> {
    return this.findByStatus(DisbursementStatus.COMPLETED);
  }

  async getFailedDisbursements(): Promise<Disbursement[]> {
    return this.findByStatus(DisbursementStatus.FAILED);
  }

  async update(id: string, updateData: Partial<Disbursement>): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    Object.assign(disbursement, updateData);
    disbursement.updatedAt = new Date();
    return this.disbursementRepository.save(disbursement);
  }

  async remove(id: string): Promise<void> {
    const result = await this.disbursementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }
  }

  async getTotalDisbursedByLoan(loanId: string): Promise<number> {
    const result = await this.disbursementRepository
      .createQueryBuilder('disbursement')
      .select('SUM(disbursement.disbursedAmount)', 'total')
      .where('disbursement.loanId = :loanId', { loanId })
      .andWhere('disbursement.status = :status', { status: DisbursementStatus.COMPLETED })
      .getRawOne();
    
    return result?.total || 0;
  }

  async getDisbursementsByDateRange(startDate: Date, endDate: Date): Promise<Disbursement[]> {
    return this.disbursementRepository.find({
      where: {
        disbursedAt: Between(startDate, endDate),
      },
      relations: ['loan', 'loan.borrower'],
      order: { disbursedAt: 'DESC' },
    });
  }

  async createSchedule(id: string, installments: Array<{ amount: number; dueDate: Date }>): Promise<Disbursement> {
    const disbursement = await this.findOne(id);
    
    const schedule = installments.map((inst, index) => ({
      ...inst,
      status: index === 0 ? 'pending' : 'scheduled',
    }));
    
    disbursement.schedule = schedule;
    disbursement.updatedAt = new Date();
    
    return this.disbursementRepository.save(disbursement);
  }

  private generateDisbursementNumber(): string {
    const prefix = 'DISB';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}