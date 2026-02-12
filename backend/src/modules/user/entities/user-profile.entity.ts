import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Entity("user_profiles")
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id", unique: true })
  userId: string;

  @Column({ nullable: true })
  employmentStatus: string;

  @Column({ nullable: true })
  employerName: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  monthlyIncome: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  yearsEmployed: number;

  @Column({ default: 0 })
  creditScore: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  totalBorrowed: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  totalRepaid: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  totalInvested: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({
    type: "enum",
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'jsonb', nullable: true })
  privacySettings: {
    profileVisibility: string;
    activityVisibility: string;
    searchVisibility: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  securitySettings: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
    unusualActivityAlerts: boolean;
  };

  @Column({ type: 'jsonb', default: { email: true, sms: false, push: true } })
  notificationPreferences: Record<string, boolean>;

  @Column({ default: 50 })
  riskScore: number;

  @Column({ type: "timestamp", nullable: true })
  lastRiskAssessment: Date;

  @Column({ type: "jsonb", nullable: true })
  investmentPreferences: Record<string, any>;

  @Column({ default: "en" })
  language: string;

  @Column({ default: "ZAR" })
  currency: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}