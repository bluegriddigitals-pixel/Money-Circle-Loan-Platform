import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('risk_assessments')
@Index(['userId'])
@Index(['score'])
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'varchar', length: 50 })
  level: string;

  @Column({ type: 'jsonb', nullable: true })
  factors: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}