import { User } from '../../user/entities/user.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { RiskFactor } from './risk-factor.entity';
export declare class RiskAssessment {
    id: string;
    user: User;
    userId: string;
    loan: Loan;
    loanId: string;
    creditScore: number;
    riskScore: number;
    riskLevel: string;
    assessmentData: any;
    assessedBy: string;
    assessedAt: Date;
    notes: string;
    riskFactors: RiskFactor[];
    createdAt: Date;
    updatedAt: Date;
}
