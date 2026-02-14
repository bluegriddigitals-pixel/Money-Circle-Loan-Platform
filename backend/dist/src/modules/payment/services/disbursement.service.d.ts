import { Repository } from 'typeorm';
import { Disbursement } from '../entities/disbursement.entity';
import { DisbursementStatus } from '../enums/disbursement.enum';
import { CreateDisbursementDto } from '../dto/create-disbursement.dto';
export declare class DisbursementService {
    private readonly disbursementRepository;
    constructor(disbursementRepository: Repository<Disbursement>);
    create(createDisbursementDto: CreateDisbursementDto): Promise<Disbursement>;
    findAll(): Promise<Disbursement[]>;
    findOne(id: string): Promise<Disbursement>;
    findByLoan(loanId: string): Promise<Disbursement[]>;
    findByStatus(status: DisbursementStatus): Promise<Disbursement[]>;
    updateStatus(id: string, status: DisbursementStatus, data?: any): Promise<Disbursement>;
    approve(id: string, approvedBy: string, notes?: string): Promise<Disbursement>;
    schedule(id: string, scheduledDate: Date): Promise<Disbursement>;
    process(id: string): Promise<Disbursement>;
    complete(id: string, transactionReference?: string): Promise<Disbursement>;
    fail(id: string, reason: string): Promise<Disbursement>;
    cancel(id: string, cancelledBy: string, reason: string): Promise<Disbursement>;
    getScheduledDisbursements(date?: Date): Promise<Disbursement[]>;
    getPendingDisbursements(): Promise<Disbursement[]>;
    getApprovedDisbursements(): Promise<Disbursement[]>;
    getProcessingDisbursements(): Promise<Disbursement[]>;
    getCompletedDisbursements(): Promise<Disbursement[]>;
    getFailedDisbursements(): Promise<Disbursement[]>;
    update(id: string, updateData: Partial<Disbursement>): Promise<Disbursement>;
    remove(id: string): Promise<void>;
    getTotalDisbursedByLoan(loanId: string): Promise<number>;
    getDisbursementsByDateRange(startDate: Date, endDate: Date): Promise<Disbursement[]>;
    createSchedule(id: string, installments: Array<{
        amount: number;
        dueDate: Date;
    }>): Promise<Disbursement>;
    private generateDisbursementNumber;
}
