import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
export declare class LoanService {
    private loanRepository;
    constructor(loanRepository: Repository<Loan>);
    create(createLoanDto: CreateLoanDto, userId: string): Promise<LoanResponseDto>;
    findAllWithFilters(filters: any, page?: number, limit?: number): Promise<{
        data: LoanResponseDto[];
        total: number;
    }>;
    findByUser(userId: string): Promise<LoanResponseDto[]>;
    findAvailableLoans(): Promise<LoanResponseDto[]>;
    getLoanStats(): Promise<any>;
    findOne(id: string, user?: any): Promise<LoanResponseDto>;
    getLoanById(id: string): Promise<Loan>;
    calculateRepaymentSchedule(id: string): Promise<any[]>;
    update(id: string, updateLoanDto: UpdateLoanDto, user: any): Promise<LoanResponseDto>;
    updateLoanStatus(id: string, status: LoanStatus, reason?: string, userId?: string): Promise<LoanResponseDto>;
    approveLoan(id: string, userId: string): Promise<LoanResponseDto>;
    rejectLoan(id: string, reason: string, userId: string): Promise<LoanResponseDto>;
    disburseLoan(id: string, userId: string): Promise<LoanResponseDto>;
    updateDisbursedAmount(loanId: string, amount: number): Promise<void>;
    completeLoan(id: string, userId: string): Promise<LoanResponseDto>;
    defaultLoan(id: string, reason: string, userId: string): Promise<LoanResponseDto>;
    remove(id: string): Promise<void>;
    private generateLoanNumber;
    private mapToLoanType;
    private mapToRepaymentFrequency;
    private toResponseDto;
}
