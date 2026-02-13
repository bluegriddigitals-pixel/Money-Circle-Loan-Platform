import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column('jsonb', { nullable: true })
  context: any;

  @CreateDateColumn()
  timestamp: Date;
}
