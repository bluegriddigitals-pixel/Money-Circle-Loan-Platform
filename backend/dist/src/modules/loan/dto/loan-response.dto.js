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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanResponseDto = exports.RepaymentScheduleItemDto = exports.CollateralResponseDto = exports.LoanDocumentResponseDto = exports.UserBasicInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const loan_entity_1 = require("../entities/loan.entity");
class UserBasicInfoDto {
}
exports.UserBasicInfoDto = UserBasicInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserBasicInfoDto.prototype, "phoneNumber", void 0);
class LoanDocumentResponseDto {
}
exports.LoanDocumentResponseDto = LoanDocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanDocumentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanDocumentResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanDocumentResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanDocumentResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanDocumentResponseDto.prototype, "uploadedAt", void 0);
class CollateralResponseDto {
}
exports.CollateralResponseDto = CollateralResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CollateralResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CollateralResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CollateralResponseDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CollateralResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LoanDocumentResponseDto] }),
    (0, class_transformer_1.Type)(() => LoanDocumentResponseDto),
    __metadata("design:type", Array)
], CollateralResponseDto.prototype, "documents", void 0);
class RepaymentScheduleItemDto {
}
exports.RepaymentScheduleItemDto = RepaymentScheduleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RepaymentScheduleItemDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RepaymentScheduleItemDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RepaymentScheduleItemDto.prototype, "principal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RepaymentScheduleItemDto.prototype, "interest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RepaymentScheduleItemDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RepaymentScheduleItemDto.prototype, "remainingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RepaymentScheduleItemDto.prototype, "status", void 0);
let LoanResponseDto = class LoanResponseDto {
    get progressPercentage() {
        return this.amount ? (this.amountPaid / this.amount) * 100 : 0;
    }
    get remainingMonths() {
        if (!this.tenureMonths || !this.createdAt)
            return null;
        const startDate = this.disbursementDate || this.createdAt;
        const elapsedMonths = this.getMonthDifference(new Date(), startDate);
        return Math.max(0, this.tenureMonths - elapsedMonths);
    }
    get isActive() {
        return this.status === loan_entity_1.LoanStatus.ACTIVE;
    }
    get isCompleted() {
        return this.status === loan_entity_1.LoanStatus.COMPLETED;
    }
    get isDefaulted() {
        return this.status === loan_entity_1.LoanStatus.DEFAULTED;
    }
    get isApproved() {
        return this.status === loan_entity_1.LoanStatus.APPROVED;
    }
    get isFunded() {
        return this.status === loan_entity_1.LoanStatus.FUNDING || this.status === loan_entity_1.LoanStatus.ACTIVE;
    }
    get daysSinceDisbursement() {
        if (!this.disbursementDate)
            return null;
        const today = new Date();
        const disbursement = new Date(this.disbursementDate);
        const diffTime = today.getTime() - disbursement.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get daysUntilMaturity() {
        if (!this.lastRepaymentDate)
            return null;
        const today = new Date();
        const maturity = new Date(this.lastRepaymentDate);
        const diffTime = maturity.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get totalRepayment() {
        return this.amount + (this.totalInterest || 0) + (this.totalFees || 0);
    }
    get fundingProgress() {
        return this.amount > 0 ? ((this.amount - this.outstandingBalance) / this.amount) * 100 : 0;
    }
    get isFullyFunded() {
        return this.outstandingBalance <= 0;
    }
    get canBeFunded() {
        return this.status === loan_entity_1.LoanStatus.APPROVED && !this.isFullyFunded;
    }
    get paymentsMade() {
        return 0;
    }
    get paymentsRemaining() {
        return this.tenureMonths - this.paymentsMade;
    }
    get daysPastDue() {
        return 0;
    }
    get isOverdue() {
        return this.daysPastDue > 0;
    }
    getMonthDifference(date1, date2) {
        const years = date1.getFullYear() - date2.getFullYear();
        const months = date1.getMonth() - date2.getMonth();
        return years * 12 + months;
    }
};
exports.LoanResponseDto = LoanResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "loanNumber", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.LoanType }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "amount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "interestRate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "tenureMonths", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.RepaymentFrequency }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "purpose", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: loan_entity_1.LoanStatus }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "amountPaid", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "outstandingBalance", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "totalInterest", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "totalFees", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "monthlyInstallment", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "disbursementDate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "firstRepaymentDate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "lastRepaymentDate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "approvedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "approvedBy", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "rejectedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "defaultedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "defaultReason", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "completedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "currency", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "gracePeriodDays", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "latePenaltyRate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "latePenaltyAmount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "latePaymentCount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "missedPaymentCount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "riskRating", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "creditScoreAtDisbursement", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "debtToIncomeRatio", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "collateralCoverageRatio", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "totalCollateralValue", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "loanToValueRatio", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Array)
], LoanResponseDto.prototype, "tags", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], LoanResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "internalNotes", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "version", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: UserBasicInfoDto }),
    (0, class_transformer_1.Type)(() => UserBasicInfoDto),
    __metadata("design:type", UserBasicInfoDto)
], LoanResponseDto.prototype, "borrower", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)({ type: [LoanDocumentResponseDto] }),
    (0, class_transformer_1.Type)(() => LoanDocumentResponseDto),
    __metadata("design:type", Array)
], LoanResponseDto.prototype, "documents", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)({ type: [CollateralResponseDto] }),
    (0, class_transformer_1.Type)(() => CollateralResponseDto),
    __metadata("design:type", Array)
], LoanResponseDto.prototype, "collaterals", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: [RepaymentScheduleItemDto] }),
    (0, class_transformer_1.Type)(() => RepaymentScheduleItemDto),
    __metadata("design:type", Array)
], LoanResponseDto.prototype, "repaymentSchedule", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "progressPercentage", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "remainingMonths", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isActive", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isCompleted", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isDefaulted", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isApproved", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isFunded", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "daysSinceDisbursement", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "daysUntilMaturity", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "totalRepayment", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "fundingProgress", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isFullyFunded", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "canBeFunded", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "paymentsMade", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "paymentsRemaining", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "daysPastDue", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], LoanResponseDto.prototype, "isOverdue", null);
exports.LoanResponseDto = LoanResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], LoanResponseDto);
//# sourceMappingURL=loan-response.dto.js.map