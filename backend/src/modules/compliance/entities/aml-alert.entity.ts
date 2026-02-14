import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum AmlAlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
  FALSE_POSITIVE = 'false_positive',
}

export enum AmlAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AmlAlertType {
  TRANSACTION = 'transaction',
  BEHAVIORAL = 'behavioral',
  SANCTIONS = 'sanctions',
  PEP = 'pep',
  ADVERSE_MEDIA = 'adverse_media',
  VELOCITY = 'velocity',
  GEO_LOCATION = 'geo_location',
  STRUCTURING = 'structuring',
}

@Entity('aml_alerts')
export class AmlAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: AmlAlertType,
  })
  alertType: AmlAlertType;

  @Column({
    type: 'enum',
    enum: AmlAlertSeverity,
  })
  severity: AmlAlertSeverity;

  @Column({
    type: 'enum',
    enum: AmlAlertStatus,
    default: AmlAlertStatus.PENDING,
  })
  status: AmlAlertStatus;

  @Column('text')
  description: string;

  @Column('jsonb')
  details: Record<string, any>;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ nullable: true })
  acknowledgedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  escalatedBy: string;

  @Column({ nullable: true })
  escalatedAt: Date;

  @Column({ nullable: true })
  escalationReason: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
