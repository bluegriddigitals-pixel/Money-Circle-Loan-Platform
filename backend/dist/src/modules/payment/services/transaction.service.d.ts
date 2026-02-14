import { Repository, FindOptionsWhere } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction.enum';
export declare class TransactionService {
    private readonly transactionRepository;
    constructor(transactionRepository: Repository<Transaction>);
    create(transactionData: Partial<Transaction>): Promise<Transaction>;
    findOne(id: string): Promise<Transaction>;
    findAll(filters?: FindOptionsWhere<Transaction>): Promise<Transaction[]>;
    findByLoan(loanId: string): Promise<Transaction[]>;
    findByEscrow(escrowAccountId: string): Promise<Transaction[]>;
    updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;
    getTotalAmount(filters?: FindOptionsWhere<Transaction>): Promise<number>;
}
