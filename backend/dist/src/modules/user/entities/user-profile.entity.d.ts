import { User } from "./user.entity";
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
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
    privacySettings: {
        profileVisibility: string;
        activityVisibility: string;
        searchVisibility: boolean;
    };
    securitySettings: {
        twoFactorEnabled: boolean;
        biometricEnabled: boolean;
        sessionTimeout: number;
        loginAlerts: boolean;
        unusualActivityAlerts: boolean;
    };
    notificationPreferences: Record<string, boolean>;
    riskScore: number;
    lastRiskAssessment: Date;
    investmentPreferences: Record<string, any>;
    language: string;
    currency: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
