import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('fraud_detections')
export class FraudDetection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  riskLevel: string;

  @Column('jsonb')
  indicators: any;

  @CreateDateColumn()
  detectedAt: Date;
}
