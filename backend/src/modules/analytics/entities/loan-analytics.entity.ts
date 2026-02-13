import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('loan_analytics')
export class LoanAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loanId: string;

  @Column('jsonb')
  metrics: any;

  @CreateDateColumn()
  recordedAt: Date;
}
