import { Repository } from 'typeorm';
import { RiskAssessment } from './entities/risk-assessment.entity';
export declare class RiskService {
    private riskRepository;
    constructor(riskRepository: Repository<RiskAssessment>);
    createAssessment(createRiskDto: any): Promise<RiskAssessment>;
    findAll(): Promise<RiskAssessment[]>;
    findOne(id: string): Promise<RiskAssessment>;
    findByUser(userId: string): Promise<RiskAssessment[]>;
    update(id: string, updateRiskDto: any): Promise<RiskAssessment>;
    remove(id: string): Promise<void>;
    calculateRiskScore(userId: string, loanAmount: number): Promise<number>;
    performInitialRiskAssessment(user: any, registerDto: any): Promise<{
        riskLevel: string;
        factors: any[];
    }>;
    calculateInitialCreditScore(user: any, registerDto: any): Promise<number>;
}
