import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  Min,
  Max,
  IsInt,
  IsObject,
} from "class-validator";
import { DecimalColumn } from "../../../shared/decorators/decimal-column.decorator";
import { User } from "../../user/entities/user.entity";
import { Loan } from "./loan.entity";
import { LoanDocument } from "./loan-document.entity";
import { LoanCollateral } from "./loan-collateral.entity";
import { LoanGuarantor } from "./loan-guarantor.entity";

export enum LoanApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  PENDING_DOCUMENTS = "pending_documents",
  CONDITIONALLY_APPROVED = "conditionally_approved",
}

export enum LoanPurpose {
  PERSONAL = "personal",
  BUSINESS = "business",
  EDUCATION = "education",
  HOME = "home",
  AUTO = "auto",
  DEBT_CONSOLIDATION = "debt_consolidation",
  OTHER = "other",
}

export enum EmploymentStatus {
  EMPLOYED = "employed",
  SELF_EMPLOYED = "self_employed",
  UNEMPLOYED = "unemployed",
  RETIRED = "retired",
  STUDENT = "student",
}

@Entity("loan_applications")
@Index(["applicationNumber"], { unique: true })
@Index(["userId"])
@Index(["status"])
@Index(["submittedAt"])
export class LoanApplication {
  @ApiProperty({
    description: "Unique identifier for the loan application",
    example: "123e4567-e89b-12d3-a456-426614174000",
    readOnly: true,
  })
  @PrimaryGeneratedColumn("uuid")
  @IsUUID("4")
  id: string;

  @ApiProperty({
    description: "Unique application number",
    example: "LA-2024-001234",
    readOnly: true,
  })
  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  @IsString()
  applicationNumber: string;

  @ApiProperty({
    description: "User ID who submitted the application",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @Column({ type: "uuid", nullable: false })
  @IsUUID("4")
  userId: string;

  @ApiPropertyOptional({
    description: "Loan ID if application is approved",
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @Column({ type: "uuid", nullable: true })
  @IsOptional()
  @IsUUID("4")
  loanId: string;

  @ApiProperty({
    description: "Loan application status",
    enum: LoanApplicationStatus,
    example: LoanApplicationStatus.SUBMITTED,
    default: LoanApplicationStatus.DRAFT,
  })
  @Column({
    type: "enum",
    enum: LoanApplicationStatus,
    default: LoanApplicationStatus.DRAFT,
    nullable: false,
  })
  @IsEnum(LoanApplicationStatus)
  status: LoanApplicationStatus;

  @ApiProperty({
    description: "Loan purpose",
    enum: LoanPurpose,
    example: LoanPurpose.PERSONAL,
  })
  @Column({
    type: "enum",
    enum: LoanPurpose,
    nullable: false,
  })
  @IsEnum(LoanPurpose)
  purpose: LoanPurpose;

  @ApiProperty({
    description: "Loan amount requested",
    example: 50000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: false })
  @IsNumber()
  @Min(0)
  requestedAmount: number;

  @ApiProperty({
    description: "Loan term in months",
    example: 36,
    minimum: 1,
    maximum: 360,
  })
  @Column({ type: "int", nullable: false })
  @IsInt()
  @Min(1)
  @Max(360)
  requestedTerm: number;

  @ApiProperty({
    description: "Interest rate offered",
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  @DecimalColumn({ precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  offeredRate: number;

  @ApiPropertyOptional({
    description: "Approved amount",
    example: 45000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount: number;

  @ApiPropertyOptional({
    description: "Approved term in months",
    example: 36,
    minimum: 1,
    maximum: 360,
  })
  @Column({ type: "int", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(360)
  approvedTerm: number;

  @ApiPropertyOptional({
    description: "Employment status",
    enum: EmploymentStatus,
    example: EmploymentStatus.EMPLOYED,
  })
  @Column({
    type: "enum",
    enum: EmploymentStatus,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @ApiPropertyOptional({
    description: "Annual income",
    example: 75000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualIncome: number;

  @ApiPropertyOptional({
    description: "Monthly expenses",
    example: 3000.0,
    minimum: 0,
  })
  @DecimalColumn({ precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses: number;

  @ApiPropertyOptional({
    description: "Credit score at time of application",
    example: 720,
    minimum: 300,
    maximum: 850,
  })
  @Column({ type: "int", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiPropertyOptional({
    description: "Risk assessment score",
    example: 65,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: "int", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  riskScore: number;

  @ApiPropertyOptional({
    description: "Risk assessment details",
    example: { factors: ["income_stable", "low_dti"], rating: "A" },
  })
  @Column({ type: "jsonb", nullable: true })
  @IsOptional()
  @IsObject()
  riskAssessment: Record<string, any>;

  @ApiPropertyOptional({
    description: "Decision reason",
    example: "Insufficient income",
  })
  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  decisionReason: string;

  @ApiPropertyOptional({
    description: "Decisioned by user ID",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @Column({ type: "uuid", nullable: true })
  @IsOptional()
  @IsUUID("4")
  decisionedBy: string;

  @ApiPropertyOptional({
    description: "Decision date",
  })
  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  @IsDate()
  decisionedAt: Date;

  @ApiProperty({
    description: "Application submission date",
  })
  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  @IsDate()
  submittedAt: Date;

  @ApiPropertyOptional({
    description: "Application expiry date",
  })
  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt: Date;

  @ApiPropertyOptional({
    description: "Additional metadata",
    example: { source: "web", campaign: "summer2024" },
  })
  @Column({ type: "jsonb", nullable: true })
  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: "Internal notes",
    example: "Customer has existing relationship",
  })
  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  internalNotes: string;

  @ApiProperty({
    description: "Loan application creation timestamp",
    readOnly: true,
  })
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    readOnly: true,
  })
  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;

  @ApiPropertyOptional({
    description: "Version for optimistic locking",
    example: 1,
    default: 1,
  })
  @Column({ type: "integer", default: 1, nullable: false })
  @IsInt()
  @Min(1)
  version: number;

  // Relations
  @ManyToOne(() => User, (user) => user.loanApplications, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToOne(() => Loan, (loan) => loan.loanApplication, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "loanId" })
  loan: Loan;

  @OneToMany(() => LoanDocument, (document) => document.loanApplication)
  documents: LoanDocument[];

  @OneToMany(() => LoanCollateral, (collateral) => collateral.loanApplication)
  collateral: LoanCollateral[];

  @OneToMany(() => LoanGuarantor, (guarantor) => guarantor.loanApplication)
  guarantors: LoanGuarantor[];

  // Lifecycle hooks
  @BeforeInsert()
  generateApplicationNumber() {
    if (!this.applicationNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      this.applicationNumber = `LA-${year}-${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateVersion() {
    this.version += 1;
  }

  // Virtual properties
  @Expose()
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  @Expose()
  get isComplete(): boolean {
    return !!(
      this.requestedAmount &&
      this.requestedTerm &&
      this.purpose &&
      this.userId
    );
  }

  @Expose()
  get daysSinceSubmission(): number | null {
    if (!this.submittedAt) return null;
    const today = new Date();
    const submitted = new Date(this.submittedAt);
    const diffTime = today.getTime() - submitted.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Business logic methods
  submit(): void {
    if (this.status !== LoanApplicationStatus.DRAFT) {
      throw new Error("Only draft applications can be submitted");
    }
    this.status = LoanApplicationStatus.SUBMITTED;
    this.submittedAt = new Date();
  }

  approve(amount: number, term: number, rate: number, approvedBy: string): void {
    if (this.status !== LoanApplicationStatus.SUBMITTED && 
        this.status !== LoanApplicationStatus.UNDER_REVIEW) {
      throw new Error("Application must be submitted or under review to approve");
    }
    this.status = LoanApplicationStatus.APPROVED;
    this.approvedAmount = amount;
    this.approvedTerm = term;
    this.offeredRate = rate;
    this.decisionedBy = approvedBy;
    this.decisionedAt = new Date();
  }

  reject(reason: string, rejectedBy: string): void {
    this.status = LoanApplicationStatus.REJECTED;
    this.decisionReason = reason;
    this.decisionedBy = rejectedBy;
    this.decisionedAt = new Date();
  }

  cancel(): void {
    this.status = LoanApplicationStatus.CANCELLED;
  }
}