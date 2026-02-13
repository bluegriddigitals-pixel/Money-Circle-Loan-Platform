import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AdminAction } from './admin-action.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN
  })
  role: UserRole;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  title: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: AdminUser;

  @OneToMany(() => AdminAction, action => action.adminUser)
  adminActions: AdminAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}