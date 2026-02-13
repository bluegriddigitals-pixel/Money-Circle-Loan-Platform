import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowAccount, EscrowAccountStatus } from '../entities/escrow-account.entity';
import { CreateEscrowAccountDto } from '../dto/create-escrow-account.dto';

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowAccount)
    private readonly escrowRepository: Repository<EscrowAccount>,
  ) {}

  async create(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount> {
    const escrowAccount = this.escrowRepository.create(createEscrowAccountDto);
    return this.escrowRepository.save(escrowAccount);
  }

  async findOne(id: string): Promise<EscrowAccount> {
    const escrow = await this.escrowRepository.findOne({
      where: { id },
      relations: ['loan', 'transactions'],
    });
    if (!escrow) {
      throw new NotFoundException('Escrow account not found');
    }
    return escrow;
  }

  async findByLoan(loanId: string): Promise<EscrowAccount[]> {
    return this.escrowRepository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateBalance(id: string, amount: number, type: 'credit' | 'debit'): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    
    if (escrow.status !== EscrowAccountStatus.ACTIVE) {
      throw new BadRequestException('Escrow account is not active');
    }

    if (type === 'credit') {
      if (escrow.maximumBalance && (Number(escrow.currentBalance) + amount) > Number(escrow.maximumBalance)) {
        throw new BadRequestException('Would exceed maximum balance');
      }
      escrow.currentBalance = Number(escrow.currentBalance) + amount;
      escrow.availableBalance = Number(escrow.availableBalance) + amount;
    } else {
      if (amount > Number(escrow.availableBalance)) {
        throw new BadRequestException('Insufficient available balance');
      }
      escrow.currentBalance = Number(escrow.currentBalance) - amount;
      escrow.availableBalance = Number(escrow.availableBalance) - amount;
    }

    return this.escrowRepository.save(escrow);
  }

  async freeze(id: string, reason: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    escrow.freeze(reason);
    return this.escrowRepository.save(escrow);
  }

  async unfreeze(id: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    escrow.unfreeze();
    return this.escrowRepository.save(escrow);
  }

  async close(id: string, reason: string): Promise<EscrowAccount> {
    const escrow = await this.findOne(id);
    escrow.close(reason);
    return this.escrowRepository.save(escrow);
  }

  async getTotalBalance(loanId?: string): Promise<number> {
    const query = this.escrowRepository.createQueryBuilder('escrow')
      .select('SUM(escrow.currentBalance)', 'total');
    
    if (loanId) {
      query.where('escrow.loanId = :loanId', { loanId });
    }
    
    const result = await query.getRawOne();
    return Number(result?.total) || 0;
  }
}