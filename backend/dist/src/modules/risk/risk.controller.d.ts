import { RiskService } from './risk.service';
import { RiskAssessment } from './entities/risk-assessment.entity';
export declare class RiskController {
    private readonly riskService;
    constructor(riskService: RiskService);
    createAssessment(createRiskDto: any): Promise<RiskAssessment>;
    getAllAssessments(): Promise<RiskAssessment[]>;
    getAssessment(id: string): Promise<RiskAssessment>;
    getUserAssessments(userId: string): Promise<RiskAssessment[]>;
    updateAssessment(id: string, updateRiskDto: any): Promise<RiskAssessment>;
    deleteAssessment(id: string): Promise<void>;
}
