// src/modules/payment/entities/transaction.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity('transactions')
@Index(['transactionNumber'], { unique: true })
@Index(['loanId'])
@Index(['escrowAccountId'])
@Index(['paymentMethodId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  transactionNumber: string;

  @Column({ type: 'uuid', nullable: true })
  loanId: string;

  @Column({ type: 'uuid', nullable: true })
  escrowAccountId: string;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId: string;

  @Column({ type: 'enum', enum: ['deposit', 'withdrawal', 'transfer', 'fee', 'interest'], nullable: false })
  type: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'], default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Loan, { nullable: true })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @ManyToOne(() => EscrowAccount, (escrowAccount) => escrowAccount.transactions, { nullable: true })
  @JoinColumn({ name: 'escrow_account_id' })
  escrowAccount: EscrowAccount;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;
}