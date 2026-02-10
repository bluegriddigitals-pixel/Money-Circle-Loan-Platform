import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum LoanStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FUNDING = 'funding',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loanNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'borrower_id' })
  borrower: User;

  @Column()
  borrowerId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  tenureMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.DRAFT,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'date', nullable: true })
  disbursementDate: Date;

  @Column({ type: 'date', nullable: true })
  firstRepaymentDate: Date;

  @Column({ type: 'date', nullable: true })
  lastRepaymentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}