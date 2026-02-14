import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAssessment } from './entities/risk-assessment.entity';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(RiskAssessment)
    private riskRepository: Repository<RiskAssessment>,
  ) {}

  async createAssessment(createRiskDto: any): Promise<RiskAssessment> {
    const assessment = this.riskRepository.create(createRiskDto);
    return this.riskRepository.save(assessment);
  }

  async findAll(): Promise<RiskAssessment[]> {
    return this.riskRepository.find({
      relations: ['user', 'loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RiskAssessment> {
    const assessment = await this.riskRepository.findOne({
      where: { id },
      relations: ['user', 'loan', 'riskFactors'],
    });
    
    if (!assessment) {
      throw new NotFoundException(`Risk assessment with ID ${id} not found`);
    }
    
    return assessment;
  }

  async findByUser(userId: string): Promise<RiskAssessment[]> {
    return this.riskRepository.find({
      where: { userId },
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateRiskDto: any): Promise<RiskAssessment> {
    const assessment = await this.findOne(id);
    Object.assign(assessment, updateRiskDto);
    return this.riskRepository.save(assessment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.riskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Risk assessment with ID ${id} not found`);
    }
  }

  async calculateRiskScore(userId: string, loanAmount: number): Promise<number> {
    // Implement risk calculation logic
    return 75;
  }

  async performInitialRiskAssessment(user: any, registerDto: any): Promise<{ riskLevel: string; factors: any[] }> {
    return { riskLevel: 'LOW', factors: [] };
  }

  async calculateInitialCreditScore(user: any, registerDto: any): Promise<number> {
    return 500;
  }
}