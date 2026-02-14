import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ComplianceCheckType {
  IDENTITY = 'identity',
  ADDRESS = 'address',
  SANCTIONS = 'sanctions',
  PEP = 'pep',
  ADVERSE_MEDIA = 'adverse_media',
  AML = 'aml',
  CREDIT = 'credit',
  BANK_ACCOUNT = 'bank_account',
}

export enum ComplianceCheckStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum ComplianceCheckResult {
  PASS = 'pass',
  FAIL = 'fail',
  REVIEW = 'review',
  PENDING = 'pending',
}

@Entity('compliance_checks')
export class ComplianceCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ComplianceCheckType,
  })
  checkType: ComplianceCheckType;

  @Column({
    type: 'enum',
    enum: ComplianceCheckStatus,
    default: ComplianceCheckStatus.PENDING,
  })
  status: ComplianceCheckStatus;

  @Column({
    type: 'enum',
    enum: ComplianceCheckResult,
    nullable: true,
  })
  result: ComplianceCheckResult;

  @Column('jsonb', { nullable: true })
  details: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
