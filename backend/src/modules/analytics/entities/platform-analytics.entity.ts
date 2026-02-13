import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('platform_analytics')
export class PlatformAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metric: string;

  @Column('jsonb')
  value: any;

  @CreateDateColumn()
  recordedAt: Date;
}
