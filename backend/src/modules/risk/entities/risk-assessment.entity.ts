import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { RiskFactor } from './risk-factor.entity';

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Loan, { nullable: true })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column({ nullable: true })
  loanId: string;

  @Column({ nullable: true })
  creditScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore: number;

  @Column({ nullable: true })
  riskLevel: string;

  @Column('jsonb', { nullable: true })
  assessmentData: any;

  @Column({ nullable: true })
  assessedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  assessedAt: Date;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => RiskFactor, riskFactor => riskFactor.assessment, { cascade: true })
  riskFactors: RiskFactor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
// REMOVE THIS LINE: export { RiskAssessment };