import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('behavioral_analyses')
export class BehavioralAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  pattern: string;

  @Column('jsonb')
  data: any;

  @CreateDateColumn()
  analyzedAt: Date;
}
