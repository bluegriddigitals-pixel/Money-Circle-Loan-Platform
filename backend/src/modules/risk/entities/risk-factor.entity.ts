import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RiskAssessment } from './risk-assessment.entity';

@Entity('risk_factors')
export class RiskFactor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RiskAssessment, assessment => assessment.riskFactors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessmentId' })
  assessment: RiskAssessment;

  @Column()
  assessmentId: string;

  @Column()
  factorName: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  category: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}