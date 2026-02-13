import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('system_maintenance')
export class SystemMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column('text')
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => AdminUser)
  @JoinColumn({ name: 'createdById' })
  createdBy: AdminUser;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}