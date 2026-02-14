import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum SanctionScreeningStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SanctionMatchStatus {
  NO_MATCH = 'no_match',
  POTENTIAL_MATCH = 'potential_match',
  CONFIRMED_MATCH = 'confirmed_match',
  FALSE_POSITIVE = 'false_positive',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('sanction_screenings')
export class SanctionScreening {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: SanctionScreeningStatus,
    default: SanctionScreeningStatus.PENDING,
  })
  status: SanctionScreeningStatus;

  @Column({
    type: 'enum',
    enum: SanctionMatchStatus,
    default: SanctionMatchStatus.NO_MATCH,
  })
  matchStatus: SanctionMatchStatus;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column('jsonb', { nullable: true })
  matches: Array<{
    listName: string;
    matchScore: number;
    matchedName: string;
    matchedId: string;
    matchDetails: Record<string, any>;
  }>;

  @Column('jsonb', { nullable: true })
  requestData: Record<string, any>;

  @Column('jsonb', { nullable: true })
  responseData: Record<string, any>;

  @Column({ nullable: true })
  screenedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewNotes: string;

  @CreateDateColumn()
  createdAt: Date;
}
