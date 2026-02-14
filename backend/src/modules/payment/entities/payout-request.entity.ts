import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EscrowAccount } from './escrow-account.entity';
import { Transaction } from './transaction.entity';
import { PayoutRequestType, PayoutMethod, PayoutRequestStatus, PayoutPriority } from '../enums/payout.enum';

@Entity('payout_requests')
export class PayoutRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => EscrowAccount, { nullable: true })
  @JoinColumn({ name: 'escrowAccountId' })
  escrowAccount: EscrowAccount;

  @Column({ nullable: true })
  escrowAccountId: string;

  @Column({
    type: 'enum',
    enum: PayoutRequestType,
  })
  type: PayoutRequestType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PayoutMethod,
  })
  payoutMethod: PayoutMethod;

  @Column()
  recipientName: string;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  recipientPhone: string;

  @Column('jsonb', { nullable: true })
  paymentDetails: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  internalReference: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('jsonb', { nullable: true })
  supportingDocuments: Array<{
    type: string;
    url: string;
    name: string;
  }>;

  @Column({
    type: 'enum',
    enum: PayoutRequestStatus,
    default: PayoutRequestStatus.PENDING,
  })
  status: PayoutRequestStatus;

  @Column({
    type: 'enum',
    enum: PayoutPriority,
    default: PayoutPriority.MEDIUM,
  })
  priority: PayoutPriority;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvalNotes: string;

  @Column({ nullable: true })
  processedBy: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  transactionReference: string;

  @Column({ nullable: true })
  externalReference: string;

  @OneToMany(() => Transaction, transaction => transaction.payoutRequest)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expectedSettlementDate: Date;

  @Column({ nullable: true })
  actualSettlementDate: Date;

  @Column({ nullable: true, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  fee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  netAmount: number;

  @Column({ nullable: true })
  receiptUrl: string;
}