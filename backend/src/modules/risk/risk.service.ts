import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  score: number;
}

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  /**
   * Perform initial risk assessment for a new user
   */
  async performInitialRiskAssessment(user: User, registerDto: RegisterDto): Promise<RiskAssessment> {
    this.logger.log(`Performing initial risk assessment for user: ${user.id}`);
    
    const factors: string[] = [];
    let score = 500; // Base score

    // Check age
    if (registerDto.dateOfBirth) {
      const age = this.calculateAge(new Date(registerDto.dateOfBirth));
      if (age < 25) {
        factors.push('young_borrower');
        score -= 50;
      } else if (age > 60) {
        factors.push('senior_borrower');
        score -= 30;
      }
    }

    // Check phone verification
    if (!registerDto.phoneNumber) {
      factors.push('no_phone_verification');
      score -= 20;
    }

    // Add default factors
    factors.push('new_user');
    factors.push('standard_risk');

    // Determine risk level based on score
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 700) riskLevel = 'LOW';
    else if (score >= 500) riskLevel = 'MEDIUM';
    else if (score >= 300) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    return {
      riskLevel,
      factors,
      score,
    };
  }

  /**
   * Calculate initial credit score for a new user
   */
  async calculateInitialCreditScore(user: User, registerDto: RegisterDto): Promise<number> {
    this.logger.log(`Calculating initial credit score for user: ${user.id}`);
    
    let score = 650; // Base score

    // Adjust based on age
    if (registerDto.dateOfBirth) {
      const age = this.calculateAge(new Date(registerDto.dateOfBirth));
      if (age >= 25 && age <= 45) score += 30;
      else if (age > 45 && age <= 60) score += 20;
      else if (age > 60) score += 10;
    }

    // Adjust based on role
    if (registerDto.role === 'lender') {
      score += 50; // Lenders typically have higher credit scores
    }

    return Math.min(850, Math.max(300, score));
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Assess loan risk
   */
  async assessLoanRisk(userId: string, amount: number, term: number): Promise<RiskAssessment> {
    this.logger.log(`Assessing loan risk for user: ${userId}, Amount: ${amount}, Term: ${term}`);
    
    const factors: string[] = [];
    let score = 600;

    // Amount risk
    if (amount > 50000) {
      factors.push('high_loan_amount');
      score -= 100;
    } else if (amount > 20000) {
      factors.push('medium_loan_amount');
      score -= 50;
    }

    // Term risk
    if (term > 36) {
      factors.push('long_term');
      score -= 50;
    } else if (term > 12) {
      factors.push('medium_term');
      score -= 25;
    }

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 700) riskLevel = 'LOW';
    else if (score >= 500) riskLevel = 'MEDIUM';
    else if (score >= 300) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    return {
      riskLevel,
      factors,
      score,
    };
  }

  /**
   * Update risk profile based on user behavior
   */
  async updateRiskProfile(userId: string, behaviorData: any): Promise<void> {
    this.logger.log(`Updating risk profile for user: ${userId}`);
    // Implement risk profile update logic
  }
}