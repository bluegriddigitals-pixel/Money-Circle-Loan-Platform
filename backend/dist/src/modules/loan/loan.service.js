"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loan_entity_1 = require("./entities/loan.entity");
const loan_response_dto_1 = require("./dto/loan-response.dto");
let LoanService = class LoanService {
    constructor(loanRepository) {
        this.loanRepository = loanRepository;
    }
    async create(createLoanDto, userId) {
        const loanType = this.mapToLoanType(createLoanDto.type);
        const repaymentFrequency = this.mapToRepaymentFrequency(createLoanDto.repaymentFrequency);
        const loanData = {
            borrowerId: userId,
            status: loan_entity_1.LoanStatus.DRAFT,
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
    async findAllWithFilters(filters, page = 1, limit = 10) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.userId)
            where.borrowerId = filters.userId;
        if (filters.minAmount || filters.maxAmount) {
            where.amount = (0, typeorm_2.Between)(filters.minAmount || 0, filters.maxAmount || 10000000);
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
    async findByUser(userId) {
        const loans = await this.loanRepository.find({
            where: { borrowerId: userId },
            relations: ['borrower'],
            order: { createdAt: 'DESC' },
        });
        return loans.map(loan => this.toResponseDto(loan));
    }
    async findAvailableLoans() {
        const loans = await this.loanRepository.find({
            where: {
                status: loan_entity_1.LoanStatus.APPROVED
            },
            relations: ['borrower'],
            order: { createdAt: 'DESC' },
        });
        return loans.map(loan => this.toResponseDto(loan));
    }
    async getLoanStats() {
        const totalLoans = await this.loanRepository.count();
        const pendingLoans = await this.loanRepository.count({ where: { status: loan_entity_1.LoanStatus.PENDING_APPROVAL } });
        const approvedLoans = await this.loanRepository.count({ where: { status: loan_entity_1.LoanStatus.APPROVED } });
        const activeLoans = await this.loanRepository.count({ where: { status: loan_entity_1.LoanStatus.ACTIVE } });
        const completedLoans = await this.loanRepository.count({ where: { status: loan_entity_1.LoanStatus.COMPLETED } });
        const defaultedLoans = await this.loanRepository.count({ where: { status: loan_entity_1.LoanStatus.DEFAULTED } });
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
    async findOne(id, user) {
        const loan = await this.loanRepository.findOne({
            where: { id },
            relations: ['borrower'],
        });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        if (user && user.role !== 'admin' && loan.borrowerId !== user.id) {
            throw new common_1.ForbiddenException('You do not have permission to view this loan');
        }
        return this.toResponseDto(loan);
    }
    async getLoanById(id) {
        const loan = await this.loanRepository.findOne({
            where: { id },
            relations: ['borrower', 'disbursements'],
        });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        return loan;
    }
    async calculateRepaymentSchedule(id) {
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
            if (balance <= 0)
                break;
        }
        return schedule;
    }
    async update(id, updateLoanDto, user) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        if (user.role !== 'admin' && loan.borrowerId !== user.id) {
            throw new common_1.ForbiddenException('You do not have permission to update this loan');
        }
        if (loan.status !== loan_entity_1.LoanStatus.DRAFT && user.role !== 'admin') {
            throw new common_1.BadRequestException('Cannot update loan that is not in draft status');
        }
        if (updateLoanDto.amount)
            loan.amount = updateLoanDto.amount;
        if (updateLoanDto.term)
            loan.tenureMonths = updateLoanDto.term;
        if (updateLoanDto.interestRate)
            loan.interestRate = updateLoanDto.interestRate;
        if (updateLoanDto.purpose)
            loan.purpose = updateLoanDto.purpose;
        if (updateLoanDto.type)
            loan.type = this.mapToLoanType(updateLoanDto.type);
        if (updateLoanDto.repaymentFrequency) {
            loan.repaymentFrequency = this.mapToRepaymentFrequency(updateLoanDto.repaymentFrequency);
        }
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async updateLoanStatus(id, status, reason, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        if (status === loan_entity_1.LoanStatus.APPROVED) {
            loan.approve(userId);
        }
        else if (status === loan_entity_1.LoanStatus.REJECTED) {
            loan.reject(reason, userId);
        }
        else if (status === loan_entity_1.LoanStatus.DEFAULTED) {
            loan.markAsDefaulted(reason);
        }
        else if (status === loan_entity_1.LoanStatus.COMPLETED) {
            loan.status = loan_entity_1.LoanStatus.COMPLETED;
            loan.completedAt = new Date();
        }
        else {
            loan.status = status;
        }
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async approveLoan(id, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        loan.approve(userId);
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async rejectLoan(id, reason, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        loan.reject(reason, userId);
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async disburseLoan(id, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        loan.disburse(new Date());
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async updateDisbursedAmount(loanId, amount) {
        const loan = await this.loanRepository.findOne({
            where: { id: loanId },
            relations: ['disbursements']
        });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${loanId} not found`);
        }
        const totalDisbursed = loan.disbursements?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
        const newTotalDisbursed = totalDisbursed + amount;
        loan.outstandingBalance = Math.max(0, loan.amount - newTotalDisbursed);
        if (loan.outstandingBalance <= 0) {
            loan.status = loan_entity_1.LoanStatus.COMPLETED;
            loan.completedAt = new Date();
        }
        await this.loanRepository.save(loan);
    }
    async completeLoan(id, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        loan.status = loan_entity_1.LoanStatus.COMPLETED;
        loan.completedAt = new Date();
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async defaultLoan(id, reason, userId) {
        const loan = await this.loanRepository.findOne({ where: { id } });
        if (!loan) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        loan.markAsDefaulted(reason);
        loan.updatedAt = new Date();
        const updated = await this.loanRepository.save(loan);
        return this.toResponseDto(updated);
    }
    async remove(id) {
        const result = await this.loanRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
    }
    generateLoanNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `LN-${year}-${random}`;
    }
    mapToLoanType(type) {
        const mapping = {
            'personal': loan_entity_1.LoanType.PERSONAL,
            'business': loan_entity_1.LoanType.BUSINESS,
            'education': loan_entity_1.LoanType.EDUCATION,
            'home': loan_entity_1.LoanType.HOME,
            'auto': loan_entity_1.LoanType.AUTO,
            'debt_consolidation': loan_entity_1.LoanType.DEBT_CONSOLIDATION,
            'payday': loan_entity_1.LoanType.PAYDAY,
            'other': loan_entity_1.LoanType.OTHER,
        };
        return mapping[type] || loan_entity_1.LoanType.PERSONAL;
    }
    mapToRepaymentFrequency(frequency) {
        const mapping = {
            'weekly': loan_entity_1.RepaymentFrequency.WEEKLY,
            'bi_weekly': loan_entity_1.RepaymentFrequency.BI_WEEKLY,
            'monthly': loan_entity_1.RepaymentFrequency.MONTHLY,
            'quarterly': loan_entity_1.RepaymentFrequency.QUARTERLY,
            'annually': loan_entity_1.RepaymentFrequency.ANNUALLY,
        };
        return mapping[frequency] || loan_entity_1.RepaymentFrequency.MONTHLY;
    }
    toResponseDto(loan) {
        const dto = new loan_response_dto_1.LoanResponseDto();
        Object.assign(dto, loan);
        return dto;
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loan_entity_1.Loan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LoanService);
//# sourceMappingURL=loan.service.js.map