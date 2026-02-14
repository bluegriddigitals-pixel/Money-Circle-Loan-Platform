import { Repository } from 'typeorm';
import { EscrowAccount } from '../entities/escrow-account.entity';
import { CreateEscrowAccountDto } from '../dto/create-escrow-account.dto';
import { EscrowAccountStatus, EscrowAccountType } from '../enums/escrow.enum';
export declare class EscrowService {
    private readonly escrowRepository;
    constructor(escrowRepository: Repository<EscrowAccount>);
    create(createEscrowAccountDto: CreateEscrowAccountDto): Promise<EscrowAccount>;
    findAll(): Promise<EscrowAccount[]>;
    findOne(id: string): Promise<EscrowAccount>;
    findByLoan(loanId: string): Promise<EscrowAccount[]>;
    findByStatus(status: EscrowAccountStatus): Promise<EscrowAccount[]>;
    findByType(type: EscrowAccountType): Promise<EscrowAccount[]>;
    updateBalance(id: string, amount: number, type: 'credit' | 'debit'): Promise<EscrowAccount>;
    reserveFunds(id: string, amount: number): Promise<EscrowAccount>;
    releaseReservedFunds(id: string, amount: number): Promise<EscrowAccount>;
    freeze(id: string, reason: string): Promise<EscrowAccount>;
    unfreeze(id: string): Promise<EscrowAccount>;
    close(id: string, reason: string): Promise<EscrowAccount>;
    release(id: string, releasedTo: string): Promise<EscrowAccount>;
    activate(id: string): Promise<EscrowAccount>;
    getTotalBalance(loanId?: string): Promise<{
        current: number;
        available: number;
    }>;
    update(id: string, updateData: Partial<EscrowAccount>): Promise<EscrowAccount>;
    remove(id: string): Promise<void>;
    getAccountSummary(id: string): Promise<Partial<EscrowAccount>>;
    getActiveAccounts(): Promise<EscrowAccount[]>;
    getFrozenAccounts(): Promise<EscrowAccount[]>;
    getClosedAccounts(): Promise<EscrowAccount[]>;
    getPendingAccounts(): Promise<EscrowAccount[]>;
    private generateAccountNumber;
}
