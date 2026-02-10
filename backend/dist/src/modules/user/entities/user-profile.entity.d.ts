import { User } from './user.entity';
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare class UserProfile {
    id: string;
    user: User;
    userId: string;
    employmentStatus: string;
    employerName: string;
    jobTitle: string;
    monthlyIncome: number;
    yearsEmployed: number;
    creditScore: number;
    totalBorrowed: number;
    totalRepaid: number;
    totalInvested: number;
    totalEarned: number;
    outstandingBalance: number;
    riskLevel: RiskLevel;
    riskScore: number;
    lastRiskAssessment: Date;
    notificationPreferences: Record<string, boolean>;
    investmentPreferences: Record<string, any>;
    language: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
