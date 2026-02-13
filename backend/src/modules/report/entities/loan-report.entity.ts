import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('loan_reports')
export class LoanReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('jsonb')
  metrics: any;

  @CreateDateColumn()
  generatedAt: Date;
}
