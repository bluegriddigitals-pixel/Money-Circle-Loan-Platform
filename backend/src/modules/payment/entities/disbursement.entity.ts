import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { DisbursementStatus } from '../enums/disbursement.enum';

@Entity('disbursements')
export class Disbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  disbursementNumber: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column()
  loanId: string;

  @ManyToOne(() => EscrowAccount, { nullable: true })
  @JoinColumn({ name: 'escrowAccountId' })
  escrowAccount: EscrowAccount;

  @Column({ nullable: true })
  escrowAccountId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  disbursedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pendingAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: DisbursementStatus,
    default: DisbursementStatus.PENDING
  })
  status: DisbursementStatus;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  disbursedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvalNotes: string;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  transactionReference: string;

  @Column('jsonb', { nullable: true })
  schedule: Array<{ amount: number; dueDate: Date; status?: string }>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}