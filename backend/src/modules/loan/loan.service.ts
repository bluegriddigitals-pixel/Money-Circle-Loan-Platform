import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Loan, LoanStatus, LoanType, RepaymentFrequency } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanResponseDto } from './dto/loan-response.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
  ) {}

  async create(createLoanDto: CreateLoanDto, userId: string): Promise<LoanResponseDto> {
    const loanType = this.mapToLoanType(createLoanDto.type);
    const repaymentFrequency = this.mapToRepaymentFrequency(createLoanDto.repaymentFrequency);

    const loanData: Partial<Loan> = {
      borrowerId: userId,
      status: LoanStatus.DRAFT,
      loanNumber: this.generateLoanNumber(),
      amount: createLoanDto.amount,
      tenureMonths: createLoanDto.term,
      interestRate: createLoanDto.interestRate,
      type: loanType,
      purpose: createLoanDto.purpose,
      repaymentFrequency: repaymentFrequency,
      currency: 'USD',
      gracePeriodDays: 0,
      latePaymentCount: 0,
      missedPaymentCount: 0,
      version: 1,
      amountPaid: 0,
      outstandingBalance: createLoanDto.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const loan = this.loanRepository.create(loanData);
    const savedLoan = await this.loanRepository.save(loan);
    return this.toResponseDto(savedLoan);
  }

  async findAllWithFilters(filters: any, page = 1, limit = 10): Promise<{ data: LoanResponseDto[]; total: number }> {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.borrowerId = filters.userId;
    if (filters.minAmount || filters.maxAmount) {
      where.amount = Between(filters.minAmount || 0, filters.maxAmount || 10000000);
    }

    const [loans, total] = await this.loanRepository.findAndCount({
      where,
      relations: ['borrower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: loans.map(loan => this.toResponseDto(loan)),
      total,
    };
  }

  async findByUser(userId: string): Promise<LoanResponseDto[]> {
    const loans = await this.loanRepository.find({
      where: { borrowerId: userId },
      relations: ['borrower'],
      order: { createdAt: 'DESC' },
    });
    return loans.map(loan => this.toResponseDto(loan));
  }

  async findAvailableLoans(): Promise<LoanResponseDto[]> {
    const loans = await this.loanRepository.find({
      where: { 
        status: LoanStatus.APPROVED 
      },
      relations: ['borrower'],
      order: { createdAt: 'DESC' },
    });
    return loans.map(loan => this.toResponseDto(loan));
  }

  async getLoanStats(): Promise<any> {
    const totalLoans = await this.loanRepository.count();
    const pendingLoans = await this.loanRepository.count({ where: { status: LoanStatus.PENDING_APPROVAL } });
    const approvedLoans = await this.loanRepository.count({ where: { status: LoanStatus.APPROVED } });
    const activeLoans = await this.loanRepository.count({ where: { status: LoanStatus.ACTIVE } });
    const completedLoans = await this.loanRepository.count({ where: { status: LoanStatus.COMPLETED } });
    const defaultedLoans = await this.loanRepository.count({ where: { status: LoanStatus.DEFAULTED } });

    const totalAmount = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.amount)', 'total')
      .getRawOne();

    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalAmount: totalAmount?.total || 0,
    };
  }

  async findOne(id: string, user?: any): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['borrower'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    if (user && user.role !== 'admin' && loan.borrowerId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this loan');
    }

    return this.toResponseDto(loan);
  }

  async getLoanById(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['borrower', 'disbursements'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async calculateRepaymentSchedule(id: string): Promise<any[]> {
    const loan = await this.getLoanById(id);
    
    const schedule = [];
    const monthlyPayment = loan.monthlyInstallment || 
      (loan.amount * (loan.interestRate / 100)) / loan.tenureMonths;
    let balance = loan.amount;
    const paymentDate = new Date(loan.firstRepaymentDate || new Date());

    for (let i = 1; i <= loan.tenureMonths; i++) {
      const interest = balance * (loan.interestRate / 100 / 12);
      const principal = monthlyPayment - interest;
      balance -= principal;

      schedule.push({
        period: i,
        dueDate: new Date(paymentDate.setMonth(paymentDate.getMonth() + 1)),
        principal: Number(principal.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        total: Number(monthlyPayment.toFixed(2)),
        remainingBalance: Number(balance.toFixed(2)),
        status: i === 1 ? 'due' : 'upcoming',
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto, user: any): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    if (user.role !== 'admin' && loan.borrowerId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this loan');
    }

    if (loan.status !== LoanStatus.DRAFT && user.role !== 'admin') {
      throw new BadRequestException('Cannot update loan that is not in draft status');
    }

    if (updateLoanDto.amount) loan.amount = updateLoanDto.amount;
    if (updateLoanDto.term) loan.tenureMonths = updateLoanDto.term;
    if (updateLoanDto.interestRate) loan.interestRate = updateLoanDto.interestRate;
    if (updateLoanDto.purpose) loan.purpose = updateLoanDto.purpose;
    if (updateLoanDto.type) loan.type = this.mapToLoanType(updateLoanDto.type);
    if (updateLoanDto.repaymentFrequency) {
      loan.repaymentFrequency = this.mapToRepaymentFrequency(updateLoanDto.repaymentFrequency);
    }

    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async updateLoanStatus(id: string, status: LoanStatus, reason?: string, userId?: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    if (status === LoanStatus.APPROVED) {
      loan.approve(userId);
    } else if (status === LoanStatus.REJECTED) {
      loan.reject(reason, userId);
    } else if (status === LoanStatus.DEFAULTED) {
      loan.markAsDefaulted(reason);
    } else if (status === LoanStatus.COMPLETED) {
      loan.status = LoanStatus.COMPLETED;
      loan.completedAt = new Date();
    } else {
      loan.status = status;
    }

    loan.updatedAt = new Date();
    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async approveLoan(id: string, userId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    loan.approve(userId);
    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async rejectLoan(id: string, reason: string, userId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    loan.reject(reason, userId);
    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async disburseLoan(id: string, userId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    loan.disburse(new Date());
    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async updateDisbursedAmount(loanId: string, amount: number): Promise<void> {
    const loan = await this.loanRepository.findOne({ 
      where: { id: loanId },
      relations: ['disbursements']
    });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${loanId} not found`);
    }

    // Calculate total disbursed amount from disbursements
    const totalDisbursed = loan.disbursements?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    const newTotalDisbursed = totalDisbursed + amount;
    
    // Update outstanding balance
    loan.outstandingBalance = Math.max(0, loan.amount - newTotalDisbursed);
    
    if (loan.outstandingBalance <= 0) {
      loan.status = LoanStatus.COMPLETED;
      loan.completedAt = new Date();
    }

    await this.loanRepository.save(loan);
  }

  async completeLoan(id: string, userId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    loan.status = LoanStatus.COMPLETED;
    loan.completedAt = new Date();
    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async defaultLoan(id: string, reason: string, userId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    loan.markAsDefaulted(reason);
    loan.updatedAt = new Date();

    const updated = await this.loanRepository.save(loan);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.loanRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
  }

  private generateLoanNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `LN-${year}-${random}`;
  }

  private mapToLoanType(type: string): LoanType {
    const mapping: Record<string, LoanType> = {
      'personal': LoanType.PERSONAL,
      'business': LoanType.BUSINESS,
      'education': LoanType.EDUCATION,
      'home': LoanType.HOME,
      'auto': LoanType.AUTO,
      'debt_consolidation': LoanType.DEBT_CONSOLIDATION,
      'payday': LoanType.PAYDAY,
      'other': LoanType.OTHER,
    };
    return mapping[type] || LoanType.PERSONAL;
  }

  private mapToRepaymentFrequency(frequency: string): RepaymentFrequency {
    const mapping: Record<string, RepaymentFrequency> = {
      'weekly': RepaymentFrequency.WEEKLY,
      'bi_weekly': RepaymentFrequency.BI_WEEKLY,
      'monthly': RepaymentFrequency.MONTHLY,
      'quarterly': RepaymentFrequency.QUARTERLY,
      'annually': RepaymentFrequency.ANNUALLY,
    };
    return mapping[frequency] || RepaymentFrequency.MONTHLY;
  }

  private toResponseDto(loan: Loan): LoanResponseDto {
    const dto = new LoanResponseDto();
    Object.assign(dto, loan);
    return dto;
  }
}