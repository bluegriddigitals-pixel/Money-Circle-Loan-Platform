import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['loan', 'escrowAccount', 'paymentMethod'],
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findAll(filters?: FindOptionsWhere<Transaction>): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: filters,
      relations: ['loan', 'escrowAccount', 'paymentMethod'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLoan(loanId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { loanId },
      relations: ['escrowAccount', 'paymentMethod'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEscrow(escrowAccountId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { escrowAccountId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.findOne(id);
    transaction.status = status;
    if (status === TransactionStatus.COMPLETED) {
      transaction.processedAt = new Date();
    }
    return this.transactionRepository.save(transaction);
  }

  async getTotalAmount(filters?: FindOptionsWhere<Transaction>): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where(filters)
      .getRawOne();
    return result?.total || 0;
  }
}