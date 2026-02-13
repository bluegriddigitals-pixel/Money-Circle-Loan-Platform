import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('risk_reports')
export class RiskReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('jsonb')
  metrics: any;

  @CreateDateColumn()
  generatedAt: Date;
}
