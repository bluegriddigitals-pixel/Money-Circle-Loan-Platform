import { LoanType, RepaymentFrequency, InterestType, LoanPurpose, LoanStatus } from '../enums/loan-status.enum';
import { LoanDocumentDto, CollateralDto } from './create-loan.dto';
export declare class UpdateLoanDto {
    type?: LoanType;
    amount?: number;
    interestRate?: number;
    interestType?: InterestType;
    term?: number;
    repaymentFrequency?: RepaymentFrequency;
    purpose?: LoanPurpose;
    status?: LoanStatus;
    description?: string;
    requiredByDate?: string;
    approvalDate?: string;
    disbursementDate?: string;
    firstPaymentDate?: string;
    maturityDate?: string;
    documents?: LoanDocumentDto[];
    collateral?: CollateralDto;
    hasCollateral?: boolean;
    rejectionReason?: string;
    notes?: string;
    approvedBy?: string;
    underwriterId?: string;
    loanOfficerId?: string;
}
