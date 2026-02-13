import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EscrowAccount } from './escrow-account.entity';
import { PayoutRequestStatus, PayoutRequestType } from '../enums/payout.enum';

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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number;

  @Column({
    type: 'enum',
    enum: PayoutRequestType
  })
  type: PayoutRequestType;

  @Column({
    type: 'enum',
    enum: PayoutRequestStatus,
    default: PayoutRequestStatus.PENDING
  })
  status: PayoutRequestStatus;

  @Column({ nullable: true })
  payoutMethod: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  recipientPhone: string;

  @Column('jsonb', { nullable: true })
  paymentDetails: any;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvalNotes: string;

  @Column({ nullable: true })
  transactionReference: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}