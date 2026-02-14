import { EscrowAccountType } from "../enums/escrow.enum";
export declare class CreateEscrowAccountDto {
    loanId?: string;
    accountName: string;
    type: EscrowAccountType;
    initialAmount?: number;
    minimumBalance?: number;
    maximumBalance?: number;
    holderName: string;
    holderEmail?: string;
    holderPhone?: string;
    beneficiaryName?: string;
    beneficiaryEmail?: string;
    bankAccount?: Record<string, any>;
    releaseConditions?: string[];
    interestRate?: number;
    maturityDate?: Date;
    notes?: string;
}
