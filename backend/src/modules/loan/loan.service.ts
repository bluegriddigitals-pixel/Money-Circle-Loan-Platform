import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOperator } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async getLoanById(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['borrower', 'loanApplication', 'collaterals', 'documents', 'guarantors', 'repayments', 'disbursements', 'escrowAccounts'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async getLoanByNumber(loanNumber: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { loanNumber },
      relations: ['borrower', 'loanApplication', 'collaterals', 'documents', 'guarantors', 'repayments', 'disbursements', 'escrowAccounts'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with number ${loanNumber} not found`);
    }

    return loan;
  }

  async findAll(filters?: {
    borrowerId?: string;
    status?: LoanStatus;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ loans: Loan[]; total: number }> {
    const query = this.loanRepository.createQueryBuilder('loan')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.collaterals', 'collaterals')
      .leftJoinAndSelect('loan.repayments', 'repayments');

    if (filters?.borrowerId) {
      query.andWhere('loan.borrowerId = :borrowerId', { borrowerId: filters.borrowerId });
    }

    if (filters?.status) {
      query.andWhere('loan.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('loan.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('loan.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('loan.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.take(filters.limit);
    }

    if (filters?.offset) {
      query.skip(filters.offset);
    }

    query.orderBy('loan.createdAt', 'DESC');

    const loans = await query.getMany();

    return { loans, total };
  }

  async getLoansByBorrower(borrowerId: string): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { borrowerId },
      relations: ['repayments', 'disbursements'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveLoans(borrowerId?: string): Promise<Loan[]> {
    const query = this.loanRepository.createQueryBuilder('loan')
      .where('loan.status IN (:...statuses)', {
        statuses: [LoanStatus.ACTIVE, LoanStatus.FUNDING],
      });

    if (borrowerId) {
      query.andWhere('loan.borrowerId = :borrowerId', { borrowerId });
    }

    query.orderBy('loan.createdAt', 'DESC');

    return query.getMany();
  }

  async getDefaultedLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { status: LoanStatus.DEFAULTED },
      relations: ['borrower'],
      order: { defaultedAt: 'DESC' },
    });
  }

  async updateLoanStatus(id: string, status: LoanStatus): Promise<Loan> {
    const loan = await this.getLoanById(id);
    loan.status = status;
    return this.loanRepository.save(loan);
  }

  async updateDisbursedAmount(loanId: string, amount: number): Promise<void> {
    // This method is called from payment service when disbursement is made
    console.log(`Updating disbursed amount for loan ${loanId}: +${amount}`);
  }

  async calculateLoanSummary(loanId: string): Promise<{
    totalPaid: number;
    outstandingBalance: number;
    progressPercentage: number;
    nextPaymentDate?: Date;
    remainingMonths: number;
  }> {
    const loan = await this.getLoanById(loanId);
    
    let nextPaymentDate: Date | undefined;
    
    if (loan.repayments) {
      const nextPayment = loan.repayments
        .filter(r => r.status === 'pending' || r.status === 'due')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      
      if (nextPayment) {
        nextPaymentDate = nextPayment.dueDate;
      }
    }

    return {
      totalPaid: loan.amountPaid,
      outstandingBalance: loan.outstandingBalance,
      progressPercentage: loan.progressPercentage,
      nextPaymentDate,
      remainingMonths: loan.remainingMonths || 0,
    };
  }

  async checkLoanEligibility(borrowerId: string, amount: number, term: number): Promise<{
    eligible: boolean;
    reasons?: string[];
    maxAmount?: number;
    maxTerm?: number;
    suggestedRate?: number;
  }> {
    const reasons: string[] = [];
    
    if (amount < 1000) {
      reasons.push('Minimum loan amount is $1,000');
    }
    
    if (amount > 100000) {
      reasons.push('Maximum loan amount is $100,000');
    }
    
    if (term < 6) {
      reasons.push('Minimum loan term is 6 months');
    }
    
    if (term > 60) {
      reasons.push('Maximum loan term is 60 months');
    }
    
    const activeLoans = await this.getActiveLoans(borrowerId);
    
    if (activeLoans.length >= 3) {
      reasons.push('You have too many active loans');
    }
    
    const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
    
    if (totalOutstanding > 50000) {
      reasons.push('Your total outstanding loan balance exceeds $50,000');
    }
    
    return {
      eligible: reasons.length === 0,
      reasons: reasons.length > 0 ? reasons : undefined,
      maxAmount: 100000,
      maxTerm: 60,
      suggestedRate: 12.5,
    };
  }

  async getLoanStatistics(): Promise<{
    totalLoans: number;
    totalActive: number;
    totalCompleted: number;
    totalDefaulted: number;
    totalOutstanding: number;
    totalDisbursed: number;
  }> {
    const [
      totalLoans,
      totalActive,
      totalCompleted,
      totalDefaulted,
    ] = await Promise.all([
      this.loanRepository.count(),
      this.loanRepository.count({ where: { status: LoanStatus.ACTIVE } }),
      this.loanRepository.count({ where: { status: LoanStatus.COMPLETED } }),
      this.loanRepository.count({ where: { status: LoanStatus.DEFAULTED } }),
    ]);

    const outstandingResult = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.outstandingBalance)', 'total')
      .getRawOne();

    const disbursedResult = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.amount)', 'total')
      .getRawOne();

    return {
      totalLoans,
      totalActive,
      totalCompleted,
      totalDefaulted,
      totalOutstanding: parseFloat(outstandingResult?.total || '0'),
      totalDisbursed: parseFloat(disbursedResult?.total || '0'),
    };
  }

  async createLoan(loanData: Partial<Loan>): Promise<Loan> {
    const loan = this.loanRepository.create(loanData);
    return this.loanRepository.save(loan);
  }

  async updateLoan(id: string, loanData: Partial<Loan>): Promise<Loan> {
    const loan = await this.getLoanById(id);
    Object.assign(loan, loanData);
    return this.loanRepository.save(loan);
  }

  async deleteLoan(id: string): Promise<void> {
    const loan = await this.getLoanById(id);
    await this.loanRepository.softRemove(loan);
  }

  async restoreLoan(id: string): Promise<Loan> {
    await this.loanRepository.restore(id);
    return this.getLoanById(id);
  }
}