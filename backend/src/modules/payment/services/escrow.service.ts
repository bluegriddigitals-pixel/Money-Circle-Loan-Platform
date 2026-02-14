import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowAccount } from '../entities/escrow-account.entity';
import { CreateEscrowAccountDto } from '../dto/create-escrow-account.dto';
import { EscrowAccountStatus, EscrowAccountType } from '../enums/escrow.enum';

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowAccount)
    private readonly escrowRepository: Repository<EscrowAccount>,
  ) {}

  async create(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount> {
    const escrowData: Partial<EscrowAccount> = {
      ...createEscrowAccountDto,
      accountNumber: this.generateAccountNumber(),
      status: EscrowAccountStatus.PENDING,
      currentBalance: 0,
      availableBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const escrowAccount = this.escrowRepository.create(escrowData);
    return this.escrowRepository.save(escrowAccount);
  }

  async findAll(): Promise<EscrowAccount[]> {
    return this.escrowRepository.find({
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EscrowAccount> {
    const escrow = await this.escrowRepository.findOne({
      where: { id },
      relations: ['loan', 'transactions'],
    });
    if (!escrow) {
      throw new NotFoundException(`Escrow account with ID ${id} not found`);
    }
    return escrow;
  }

  async findByLoan(loanId: string): Promise<EscrowAccount[]> {
    return this.escrowRepository.find({
      where: { loanId },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: EscrowAccountStatus): Promise<EscrowAccount[]> {
    return this.escrowRepository.find({
      where: { status },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: EscrowAccountType): Promise<EscrowAccount[]> {
    return this.escrowRepository.find({
      where: { type },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBalance(id: string, amount: number, type: 'credit' | 'debit'): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    if (escrow.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    const currentBalance = Number(escrow.currentBalance);
    const availableBalance = Number(escrow.availableBalance);
    const maxBalance = escrow.maximumBalance ? Number(escrow.maximumBalance) : null;

    if (type === 'credit') {
      if (maxBalance && (currentBalance + amount) > maxBalance) {
        throw new BadRequestException(`Would exceed maximum balance of ${maxBalance}`);
      }
      escrow.currentBalance = currentBalance + amount;
      escrow.availableBalance = availableBalance + amount;
    } else {
      if (amount > availableBalance) {
        throw new BadRequestException(`Insufficient available balance. Available: ${availableBalance}, Requested: ${amount}`);
      }
      escrow.currentBalance = currentBalance - amount;
      escrow.availableBalance = availableBalance - amount;
    }

    escrow.updatedAt = new Date();
    return this.escrowRepository.save(escrow);
  }

  async reserveFunds(id: string, amount: number): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    if (escrow.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    if (amount > Number(escrow.availableBalance)) {
      throw new BadRequestException(`Insufficient available balance. Available: ${escrow.availableBalance}, Requested: ${amount}`);
    }

    escrow.availableBalance = Number(escrow.availableBalance) - amount;
    escrow.updatedAt = new Date();

    return this.escrowRepository.save(escrow);
  }

  async releaseReservedFunds(id: string, amount: number): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    if (escrow.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    escrow.availableBalance = Number(escrow.availableBalance) + amount;
    escrow.updatedAt = new Date();

    return this.escrowRepository.save(escrow);
  }

  async freeze(id: string, reason: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    escrow.status = EscrowAccountStatus.FROZEN;
    escrow.frozenReason = reason;
    escrow.updatedAt = new Date();
    
    return this.escrowRepository.save(escrow);
  }

  async unfreeze(id: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    escrow.status = EscrowAccountStatus.ACTIVE;
    escrow.frozenReason = null;
    escrow.updatedAt = new Date();
    
    return this.escrowRepository.save(escrow);
  }

  async close(id: string, reason: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    if (Number(escrow.currentBalance) > 0) {
      throw new BadRequestException('Cannot close escrow account with positive balance');
    }

    escrow.status = EscrowAccountStatus.CLOSED;
    escrow.closedReason = reason;
    escrow.closedAt = new Date();
    escrow.updatedAt = new Date();
    
    return this.escrowRepository.save(escrow);
  }

  async release(id: string, releasedTo: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    escrow.releasedAt = new Date();
    escrow.releasedTo = releasedTo;
    escrow.updatedAt = new Date();
    
    return this.escrowRepository.save(escrow);
  }

  async activate(id: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    escrow.status = EscrowAccountStatus.ACTIVE;
    escrow.updatedAt = new Date();
    
    return this.escrowRepository.save(escrow);
  }

  async getTotalBalance(loanId?: string): Promise<{ current: number; available: number }> {
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

  async update(id: string, updateData: Partial<EscrowAccount>): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    Object.assign(escrow, updateData);
    escrow.updatedAt = new Date();
    return this.escrowRepository.save(escrow);
  }

  async remove(id: string): Promise<void> {
    const result = await this.escrowRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Escrow account with ID ${id} not found`);
    }
  }

  async getAccountSummary(id: string): Promise<Partial<EscrowAccount>> {
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

  async getActiveAccounts(): Promise<EscrowAccount[]> {
    return this.findByStatus(EscrowAccountStatus.ACTIVE);
  }

  async getFrozenAccounts(): Promise<EscrowAccount[]> {
    return this.findByStatus(EscrowAccountStatus.FROZEN);
  }

  async getClosedAccounts(): Promise<EscrowAccount[]> {
    return this.findByStatus(EscrowAccountStatus.CLOSED);
  }

  async getPendingAccounts(): Promise<EscrowAccount[]> {
    return this.findByStatus(EscrowAccountStatus.PENDING);
  }

  private generateAccountNumber(): string {
    const prefix = 'ESC';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}