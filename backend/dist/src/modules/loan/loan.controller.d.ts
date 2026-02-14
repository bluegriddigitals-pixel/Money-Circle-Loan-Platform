import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
import { LoanStatus } from './entities/loan.entity';
export declare class LoanController {
    private readonly loanService;
    constructor(loanService: LoanService);
    create(createLoanDto: CreateLoanDto, req: any): Promise<LoanResponseDto>;
    findAll(page?: number, limit?: number, status?: LoanStatus, userId?: string, minAmount?: number, maxAmount?: number, startDate?: string, endDate?: string): Promise<{
        data: LoanResponseDto[];
        total: number;
    }>;
    findMyLoans(req: any): Promise<LoanResponseDto[]>;
    findAvailableLoans(): Promise<LoanResponseDto[]>;
    getStats(): Promise<any>;
    findOne(id: string, req: any): Promise<LoanResponseDto>;
    getRepaymentSchedule(id: string): Promise<any[]>;
    update(id: string, updateLoanDto: UpdateLoanDto, req: any): Promise<LoanResponseDto>;
    updateStatus(id: string, status: LoanStatus, reason: string, req: any): Promise<LoanResponseDto>;
    approve(id: string, req: any): Promise<LoanResponseDto>;
    reject(id: string, reason: string, req: any): Promise<LoanResponseDto>;
    disburse(id: string, req: any): Promise<LoanResponseDto>;
    complete(id: string, req: any): Promise<LoanResponseDto>;
    default(id: string, reason: string, req: any): Promise<LoanResponseDto>;
    remove(id: string): Promise<void>;
}
