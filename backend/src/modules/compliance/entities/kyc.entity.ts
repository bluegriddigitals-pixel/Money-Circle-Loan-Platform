import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { KycDocument } from './kyc-document.entity';

export enum KycStatus {
  INITIATED = 'initiated',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  EXPIRED = 'expired',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  PENDING = 'pending',
  REVIEW = 'review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('kyc')
export class Kyc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
  })
  status: KycStatus;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewNotes: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  returnReason: string;

  @Column({ nullable: true })
  expiredAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => KycDocument, document => document.kyc, {
    cascade: true,
  })
  documents: KycDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
