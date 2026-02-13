import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column()
  message: string;

  @Column({ default: 'sent' })
  status: string;

  @CreateDateColumn()
  sentAt: Date;
}
