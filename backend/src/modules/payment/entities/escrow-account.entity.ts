import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Loan } from '../../loan/entities/loan.entity';
import { Transaction } from './transaction.entity';
import { EscrowAccountStatus, EscrowAccountType } from '../enums/escrow.enum';

@Entity('escrow_accounts')
export class EscrowAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accountNumber: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column()
  loanId: string;

  @Column({
    type: 'enum',
    enum: EscrowAccountType,
    default: EscrowAccountType.STANDARD
  })
  type: EscrowAccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumBalance: number;

  @Column({
    type: 'enum',
    enum: EscrowAccountStatus,
    default: EscrowAccountStatus.PENDING,
  })
  status: EscrowAccountStatus;

  @Column({ nullable: true })
  frozenReason: string;

  @Column({ nullable: true })
  closedReason: string;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ nullable: true })
  releasedAt: Date;

  @Column({ nullable: true })
  releasedTo: string;

  @OneToMany(() => Transaction, transaction => transaction.escrowAccount)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}