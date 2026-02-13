import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user_analytics')
export class UserAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  metrics: any;

  @CreateDateColumn()
  recordedAt: Date;
}
