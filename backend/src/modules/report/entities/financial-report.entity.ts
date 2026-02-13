import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('financial_reports')
export class FinancialReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  period: string;

  @Column('jsonb')
  data: any;

  @CreateDateColumn()
  generatedAt: Date;
}
