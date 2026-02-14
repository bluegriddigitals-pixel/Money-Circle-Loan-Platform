import { LoanType, RepaymentFrequency, InterestType, LoanPurpose } from '../enums/loan-status.enum';
export declare class LoanDocumentDto {
    type: string;
    url: string;
    name?: string;
}
export declare class CollateralDto {
    type: string;
    value: number;
    description?: string;
    documents?: LoanDocumentDto[];
}
export declare class CreateLoanDto {
    type: LoanType;
    amount: number;
    interestRate: number;
    interestType: InterestType;
    term: number;
    repaymentFrequency: RepaymentFrequency;
    purpose: LoanPurpose;
    description?: string;
    applicationDate?: string;
    requiredByDate?: string;
    documents?: LoanDocumentDto[];
    collateral?: CollateralDto;
    hasCollateral?: boolean;
    existingLoanId?: string;
    notes?: string;
}
