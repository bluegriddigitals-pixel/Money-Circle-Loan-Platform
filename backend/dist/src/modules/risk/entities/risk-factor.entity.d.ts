import { RiskAssessment } from './risk-assessment.entity';
export declare class RiskFactor {
    id: string;
    assessment: RiskAssessment;
    assessmentId: string;
    factorName: string;
    weight: number;
    score: number;
    description: string;
    isActive: boolean;
    category: string;
    metadata: any;
    createdAt: Date;
}
