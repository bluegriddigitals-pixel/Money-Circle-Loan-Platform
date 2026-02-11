import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    BeforeInsert,
    BeforeUpdate,
    AfterInsert,
    AfterUpdate,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    ApiProperty,
    ApiPropertyOptional,
    ApiHideProperty,
} from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsDate,
    IsUUID,
    IsNotEmpty,
    Min,
    Max,
    IsInt,
    ValidateNested,
    IsObject,
    IsArray,
    MaxLength,
    MinLength,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from './loan.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanDocument } from './loan-document.entity';

export enum CollateralType {
    REAL_ESTATE = 'real_estate',
    VEHICLE = 'vehicle',
    EQUIPMENT = 'equipment',
    INVENTORY = 'inventory',
    ACCOUNTS_RECEIVABLE = 'accounts_receivable',
    SAVINGS_ACCOUNT = 'savings_account',
    INVESTMENT_PORTFOLIO = 'investment_portfolio',
    JEWELRY = 'jewelry',
    ART = 'art',
    OTHER = 'other',
}

export enum CollateralStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    RELEASED = 'released',
    SEIZED = 'seized',
    SOLD = 'sold',
    DAMAGED = 'damaged',
    LOST = 'lost',
    UNDER_REVIEW = 'under_review',
}

export enum OwnershipType {
    SOLE = 'sole',
    JOINT = 'joint',
    CORPORATE = 'corporate',
    TRUST = 'trust',
}

export enum InsuranceStatus {
    NOT_INSURED = 'not_insured',
    INSURED = 'insured',
    UNDER_INSURED = 'under_insured',
    INSURANCE_EXPIRED = 'insurance_expired',
}

@Entity('loan_collaterals')
@Index(['loanId'])
@Index(['loanApplicationId'])
@Index(['collateralType'])
@Index(['status'])
@Index(['registrationNumber'], { unique: true, where: 'registration_number IS NOT NULL' })
@Index(['createdAt'])
export class LoanCollateral {
    @ApiProperty({
        description: 'Unique identifier for the collateral',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4')
    id: string;

    @ApiProperty({
        description: 'Unique collateral reference number',
        example: 'COL-2024-001234',
        readOnly: true,
    })
    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    @IsString()
    @IsNotEmpty()
    collateralNumber: string;

    @ApiPropertyOptional({
        description: 'ID of the loan (if associated with a loan)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    loanId: string;

    @ApiPropertyOptional({
        description: 'ID of the loan application (if associated with an application)',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    loanApplicationId: string;

    @ApiProperty({
        description: 'Collateral type',
        enum: CollateralType,
        example: CollateralType.REAL_ESTATE,
    })
    @Column({
        type: 'enum',
        enum: CollateralType,
        nullable: false,
    })
    @IsEnum(CollateralType)
    collateralType: CollateralType;

    @ApiProperty({
        description: 'Collateral name/description',
        example: 'Residential Property - 123 Main Street',
    })
    @Column({ type: 'varchar', length: 255, nullable: false })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({
        description: 'Detailed description',
        example: '3-bedroom house with garage, located in suburban area',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description: string;

    @ApiProperty({
        description: 'Appraised value',
        example: 250000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: false })
    @IsNumber()
    @Min(0)
    appraisedValue: number;

    @ApiProperty({
        description: 'Appraisal currency',
        example: 'USD',
        default: 'USD',
    })
    @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
    @IsString()
    @MinLength(3)
    @MaxLength(3)
    currency: string;

    @ApiPropertyOptional({
        description: 'Loan-to-value ratio (LTV) percentage',
        example: 65.0,
        minimum: 0,
        maximum: 100,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    loanToValueRatio: number;

    @ApiPropertyOptional({
        description: 'Maximum loan amount based on LTV',
        example: 162500.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxLoanAmount: number;

    @ApiPropertyOptional({
        description: 'Collateral coverage ratio',
        example: 1.54,
        minimum: 0,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    coverageRatio: number;

    @ApiPropertyOptional({
        description: 'Market value',
        example: 275000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    marketValue: number;

    @ApiPropertyOptional({
        description: 'Forced sale value (liquidation value)',
        example: 200000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    forcedSaleValue: number;

    @ApiPropertyOptional({
        description: 'Purchase price (if recently purchased)',
        example: 230000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePrice: number;

    @ApiPropertyOptional({
        description: 'Purchase date',
        example: '2020-05-15',
    })
    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    purchaseDate: Date;

    @ApiPropertyOptional({
        description: 'Year of manufacture (for vehicles/equipment)',
        example: 2022,
        minimum: 1900,
    })
    @Column({ type: 'integer', nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1900)
    yearOfManufacture: number;

    @ApiPropertyOptional({
        description: 'Make/brand (for vehicles/equipment)',
        example: 'Toyota',
    })
    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    make: string;

    @ApiPropertyOptional({
        description: 'Model (for vehicles/equipment)',
        example: 'Camry',
    })
    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    model: string;

    @ApiPropertyOptional({
        description: 'Serial/registration number',
        example: 'ABC123456',
    })
    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    registrationNumber: string;

    @ApiPropertyOptional({
        description: 'VIN/Chassis number (for vehicles)',
        example: '1HGCM82633A123456',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    vinNumber: string;

    @ApiPropertyOptional({
        description: 'Engine number (for vehicles)',
        example: 'ENG123456789',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    engineNumber: string;

    @ApiPropertyOptional({
        description: 'Property address (for real estate)',
        example: '123 Main Street, Anytown, USA 12345',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    propertyAddress: string;

    @ApiPropertyOptional({
        description: 'Property size (in square feet/meters)',
        example: 2000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 10, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    propertySize: number;

    @ApiPropertyOptional({
        description: 'Property size unit',
        example: 'sqft',
    })
    @Column({ type: 'varchar', length: 10, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    propertySizeUnit: string;

    @ApiPropertyOptional({
        description: 'Land size (in square feet/meters)',
        example: 5000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 10, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    landSize: number;

    @ApiPropertyOptional({
        description: 'Land size unit',
        example: 'sqft',
    })
    @Column({ type: 'varchar', length: 10, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    landSizeUnit: string;

    @ApiPropertyOptional({
        description: 'Quantity (for inventory/equipment)',
        example: 100,
        minimum: 1,
    })
    @Column({ type: 'integer', nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({
        description: 'Unit of measure',
        example: 'pieces',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    unitOfMeasure: string;

    @ApiPropertyOptional({
        description: 'Condition/grade',
        example: 'excellent',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    condition: string;

    @ApiPropertyOptional({
        description: 'Age in years',
        example: 5.5,
        minimum: 0,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    age: number;

    @ApiPropertyOptional({
        description: 'Depreciation rate (annual percentage)',
        example: 10.0,
        minimum: 0,
        maximum: 100,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    depreciationRate: number;

    @ApiPropertyOptional({
        description: 'Residual value after depreciation',
        example: 150000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    residualValue: number;

    @ApiProperty({
        description: 'Ownership type',
        enum: OwnershipType,
        example: OwnershipType.SOLE,
        default: OwnershipType.SOLE,
    })
    @Column({
        type: 'enum',
        enum: OwnershipType,
        default: OwnershipType.SOLE,
        nullable: false,
    })
    @IsEnum(OwnershipType)
    ownershipType: OwnershipType;

    @ApiPropertyOptional({
        description: 'Ownership percentage (for joint ownership)',
        example: 100.0,
        minimum: 0,
        maximum: 100,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    ownershipPercentage: number;

    @ApiPropertyOptional({
        description: 'Co-owners information',
        example: [
            { name: 'Jane Doe', percentage: 50, relationship: 'spouse' },
            { name: 'John Doe', percentage: 50, relationship: 'self' },
        ],
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsArray()
    coOwners: Array<{
        name: string;
        percentage: number;
        relationship: string;
        idNumber?: string;
    }>;

    @ApiPropertyOptional({
        description: 'Legal owner name',
        example: 'John Doe',
    })
    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    legalOwner: string;

    @ApiPropertyOptional({
        description: 'Registration/Title number',
        example: 'T123456789',
    })
    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    titleNumber: string;

    @ApiPropertyOptional({
        description: 'Registration/Title date',
        example: '2020-05-20',
    })
    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    titleDate: Date;

    @ApiPropertyOptional({
        description: 'Title deed/registration document storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/title_deed.pdf',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    titleDocumentPath: string;

    @ApiPropertyOptional({
        description: 'Insurance status',
        enum: InsuranceStatus,
        example: InsuranceStatus.INSURED,
        default: InsuranceStatus.NOT_INSURED,
    })
    @Column({
        type: 'enum',
        enum: InsuranceStatus,
        default: InsuranceStatus.NOT_INSURED,
        nullable: false,
    })
    @IsEnum(InsuranceStatus)
    insuranceStatus: InsuranceStatus;

    @ApiPropertyOptional({
        description: 'Insurance company',
        example: 'State Farm Insurance',
    })
    @Column({ type: 'varchar', length: 200, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    insuranceCompany: string;

    @ApiPropertyOptional({
        description: 'Insurance policy number',
        example: 'POL123456789',
    })
    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    insurancePolicyNumber: string;

    @ApiPropertyOptional({
        description: 'Insurance coverage amount',
        example: 250000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    insuranceCoverageAmount: number;

    @ApiPropertyOptional({
        description: 'Insurance premium amount',
        example: 1500.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    insurancePremium: number;

    @ApiPropertyOptional({
        description: 'Insurance expiry date',
        example: '2024-12-31',
    })
    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    insuranceExpiryDate: Date;

    @ApiPropertyOptional({
        description: 'Insurance document storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/insurance_policy.pdf',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    insuranceDocumentPath: string;

    @ApiPropertyOptional({
        description: 'Storage location',
        example: 'Secure Storage Facility #123, 456 Warehouse Rd',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    storageLocation: string;

    @ApiPropertyOptional({
        description: 'Storage facility contact',
        example: 'John Smith, +1234567890',
    })
    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsString()
    storageContact: string;

    @ApiPropertyOptional({
        description: 'Storage cost per period',
        example: 100.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    storageCost: number;

    @ApiPropertyOptional({
        description: 'Storage period (e.g., monthly, annually)',
        example: 'monthly',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    storagePeriod: string;

    @ApiPropertyOptional({
        description: 'Inspection schedule',
        example: 'quarterly',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    inspectionSchedule: string;

    @ApiPropertyOptional({
        description: 'Last inspection date',
    })
    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    lastInspectionDate: Date;

    @ApiPropertyOptional({
        description: 'Next inspection date',
    })
    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    nextInspectionDate: Date;

    @ApiPropertyOptional({
        description: 'Inspection report storage path',
        example: 'https://s3.amazonaws.com/bucket/documents/inspection_report_2024.pdf',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    inspectionReportPath: string;

    @ApiPropertyOptional({
        description: 'Maintenance requirements',
        example: 'Annual servicing required',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    maintenanceRequirements: string;

    @ApiPropertyOptional({
        description: 'Maintenance cost estimate',
        example: 500.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maintenanceCost: number;

    @ApiProperty({
        description: 'Collateral status',
        enum: CollateralStatus,
        example: CollateralStatus.ACTIVE,
        default: CollateralStatus.PENDING,
    })
    @Column({
        type: 'enum',
        enum: CollateralStatus,
        default: CollateralStatus.PENDING,
        nullable: false,
    })
    @IsEnum(CollateralStatus)
    status: CollateralStatus;

    @ApiPropertyOptional({
        description: 'Status change reason',
        example: 'Loan fully repaid',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    statusChangeReason: string;

    @ApiPropertyOptional({
        description: 'Release date (when collateral was released)',
    })
    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    releasedAt: Date;

    @ApiPropertyOptional({
        description: 'Seizure date (when collateral was seized)',
    })
    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    seizedAt: Date;

    @ApiPropertyOptional({
        description: 'Sale date (when collateral was sold)',
    })
    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    soldAt: Date;

    @ApiPropertyOptional({
        description: 'Sale price',
        example: 240000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salePrice: number;

    @ApiPropertyOptional({
        description: 'Sale proceeds distribution',
        example: {
            loanRepayment: 200000,
            fees: 10000,
            remainderToBorrower: 30000,
        },
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsObject()
    saleProceedsDistribution: Record<string, number>;

    @ApiPropertyOptional({
        description: 'Damage/loss date',
    })
    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    damageDate: Date;

    @ApiPropertyOptional({
        description: 'Damage/loss description',
        example: 'Fire damage to garage area',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    damageDescription: string;

    @ApiPropertyOptional({
        description: 'Estimated repair cost',
        example: 15000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedRepairCost: number;

    @ApiPropertyOptional({
        description: 'Insurance claim number',
        example: 'CLM123456789',
    })
    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    insuranceClaimNumber: string;

    @ApiPropertyOptional({
        description: 'Insurance claim status',
        example: 'pending',
    })
    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsOptional()
    @IsString()
    insuranceClaimStatus: string;

    @ApiPropertyOptional({
        description: 'Insurance settlement amount',
        example: 12000.0,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    insuranceSettlementAmount: number;

    @ApiPropertyOptional({
        description: 'Risk assessment score (0-100)',
        example: 85.5,
        minimum: 0,
        maximum: 100,
    })
    @DecimalColumn({ precision: 5, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    riskScore: number;

    @ApiPropertyOptional({
        description: 'Risk factors',
        example: ['age', 'location', 'market_volatility'],
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsArray()
    riskFactors: string[];

    @ApiPropertyOptional({
        description: 'Risk mitigation measures',
        example: ['insurance', 'regular_inspections', 'secure_storage'],
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsArray()
    riskMitigation: string[];

    @ApiPropertyOptional({
        description: 'Notes/comments',
        example: 'Collateral is in excellent condition with regular maintenance',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    notes: string;

    @ApiPropertyOptional({
        description: 'Internal notes',
        example: 'Requires additional insurance coverage for full value',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    internalNotes: string;

    @ApiPropertyOptional({
        description: 'Tags for categorization',
        example: ['primary', 'high_value', 'requires_insurance'],
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsArray()
    tags: string[];

    @ApiPropertyOptional({
        description: 'Additional metadata',
        example: { customField1: 'value1', customField2: 'value2' },
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsObject()
    metadata: Record<string, any>;

    @ApiProperty({
        description: 'Collateral creation timestamp',
        readOnly: true,
    })
    @CreateDateColumn({ type: 'timestamp' })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        readOnly: true,
    })
    @UpdateDateColumn({ type: 'timestamp' })
    @Expose()
    updatedAt: Date;

    @ApiHideProperty()
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;

    @ApiPropertyOptional({
        description: 'Version for optimistic locking',
        example: 1,
        default: 1,
    })
    @Column({ type: 'integer', default: 1, nullable: false })
    @IsInt()
    @Min(1)
    version: number;

    // Relations
    @ApiPropertyOptional({
        description: 'Loan associated with this collateral',
        type: () => Loan,
    })
    @ManyToOne(() => Loan, (loan) => loan.collaterals, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'loanId' })
    @ValidateNested()
    @Type(() => Loan)
    loan: Loan;

    @ApiPropertyOptional({
        description: 'Loan application associated with this collateral',
        type: () => LoanApplication,
    })
    @ManyToOne(() => LoanApplication, (application) => application.collaterals, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'loanApplicationId' })
    @ValidateNested()
    @Type(() => LoanApplication)
    loanApplication: LoanApplication;

    @ApiPropertyOptional({
        description: 'Collateral documents',
        type: () => [LoanDocument],
    })
    @OneToMany(() => LoanDocument, (document) => document.collateral, {
        cascade: true,
    })
    @ValidateNested({ each: true })
    @Type(() => LoanDocument)
    documents: LoanDocument[];

    // Computed properties
    @ApiProperty({
        description: 'Current value (considering depreciation)',
        example: 225000.0,
        readOnly: true,
    })
    @Expose()
    get currentValue(): number {
        if (this.residualValue !== undefined && this.residualValue !== null) {
            return this.residualValue;
        }

        if (this.appraisedValue && this.age && this.depreciationRate) {
            const depreciation = (this.appraisedValue * this.depreciationRate * this.age) / 100;
            return Math.max(0, this.appraisedValue - depreciation);
        }

        return this.appraisedValue || 0;
    }

    @ApiProperty({
        description: 'Depreciation amount',
        example: 25000.0,
        readOnly: true,
    })
    @Expose()
    get depreciationAmount(): number {
        return (this.appraisedValue || 0) - this.currentValue;
    }

    @ApiProperty({
        description: 'Whether collateral is insured',
        example: true,
        readOnly: true,
    })
    @Expose()
    get isInsured(): boolean {
        return this.insuranceStatus === InsuranceStatus.INSURED;
    }

    @ApiProperty({
        description: 'Whether insurance is expired',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isInsuranceExpired(): boolean {
        if (!this.insuranceExpiryDate) return false;
        return new Date() > this.insuranceExpiryDate;
    }

    @ApiProperty({
        description: 'Days until insurance expiry (negative if expired)',
        example: 120,
        readOnly: true,
    })
    @Expose()
    get daysUntilInsuranceExpiry(): number | null {
        if (!this.insuranceExpiryDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(this.insuranceExpiryDate);
        expiry.setHours(0, 0, 0, 0);

        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    @ApiProperty({
        description: 'Whether collateral is active',
        example: true,
        readOnly: true,
    })
    @Expose()
    get isActive(): boolean {
        return this.status === CollateralStatus.ACTIVE;
    }

    @ApiProperty({
        description: 'Whether collateral is released',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isReleased(): boolean {
        return this.status === CollateralStatus.RELEASED;
    }

    @ApiProperty({
        description: 'Whether collateral is seized',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isSeized(): boolean {
        return this.status === CollateralStatus.SEIZED;
    }

    @ApiProperty({
        description: 'Whether collateral is sold',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isSold(): boolean {
        return this.status === CollateralStatus.SOLD;
    }

    @ApiProperty({
        description: 'Whether collateral is damaged',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isDamaged(): boolean {
        return this.status === CollateralStatus.DAMAGED;
    }

    @ApiProperty({
        description: 'Whether collateral is lost',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isLost(): boolean {
        return this.status === CollateralStatus.LOST;
    }

    @ApiProperty({
        description: 'Whether collateral is under review',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isUnderReview(): boolean {
        return this.status === CollateralStatus.UNDER_REVIEW;
    }

    @ApiProperty({
        description: 'Collateral age in years',
        example: 5.5,
        readOnly: true,
    })
    @Expose()
    get ageInYears(): number {
        if (this.age !== undefined && this.age !== null) {
            return this.age;
        }

        if (this.yearOfManufacture) {
            const currentYear = new Date().getFullYear();
            return currentYear - this.yearOfManufacture;
        }

        if (this.purchaseDate) {
            const purchase = new Date(this.purchaseDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - purchase.getTime());
            return diffTime / (1000 * 60 * 60 * 24 * 365.25);
        }

        return 0;
    }

    @ApiProperty({
        description: 'Insurance coverage adequacy',
        example: 100.0,
        readOnly: true,
    })
    @Expose()
    get insuranceCoverageAdequacy(): number {
        if (!this.insuranceCoverageAmount || !this.currentValue || this.currentValue === 0) {
            return 0;
        }

        return (this.insuranceCoverageAmount / this.currentValue) * 100;
    }

    @ApiProperty({
        description: 'Whether insurance coverage is adequate (>90%)',
        example: true,
        readOnly: true,
    })
    @Expose()
    get hasAdequateInsurance(): boolean {
        return this.insuranceCoverageAdequacy >= 90;
    }

    @ApiProperty({
        description: 'Value variance (market vs appraised)',
        example: 10.0,
        readOnly: true,
    })
    @Expose()
    get valueVariance(): number {
        if (!this.marketValue || !this.appraisedValue || this.appraisedValue === 0) {
            return 0;
        }

        return ((this.marketValue - this.appraisedValue) / this.appraisedValue) * 100;
    }

    @ApiProperty({
        description: 'Liquidation value percentage',
        example: 80.0,
        readOnly: true,
    })
    @Expose()
    get liquidationValuePercentage(): number {
        if (!this.forcedSaleValue || !this.currentValue || this.currentValue === 0) {
            return 0;
        }

        return (this.forcedSaleValue / this.currentValue) * 100;
    }

    @ApiProperty({
        description: 'Days until next inspection (negative if overdue)',
        example: 30,
        readOnly: true,
    })
    @Expose()
    get daysUntilNextInspection(): number | null {
        if (!this.nextInspectionDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const inspection = new Date(this.nextInspectionDate);
        inspection.setHours(0, 0, 0, 0);

        const diffTime = inspection.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Lifecycle hooks
    @BeforeInsert()
    async beforeInsert() {
        if (!this.collateralNumber) {
            this.collateralNumber = this.generateCollateralNumber();
        }

        // Calculate derived values
        this.calculateDerivedValues();

        // Set next inspection date if schedule exists
        this.scheduleNextInspection();
    }

    @BeforeUpdate()
    async beforeUpdate() {
        // Update version for optimistic locking
        this.version += 1;

        // Calculate derived values
        this.calculateDerivedValues();

        // Handle status transitions
        this.handleStatusTransitions();

        // Check insurance expiry
        this.checkInsuranceExpiry();
    }

    @AfterInsert()
    async afterInsert() {
        console.log(`Loan collateral created: ${this.collateralNumber} (${this.id})`);
        // Emit event: loan.collateral.created
    }

    @AfterUpdate()
    async afterUpdate() {
        console.log(`Loan collateral updated: ${this.collateralNumber} (${this.id})`);
        // Emit event: loan.collateral.updated
    }

    // Business logic methods
    private generateCollateralNumber(): string {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `COL-${new Date().getFullYear()}-${timestamp}${random}`;
    }

    private calculateDerivedValues(): void {
        // Calculate current value
        this.currentValue; // This will trigger the getter

        // Calculate coverage ratio
        if (this.appraisedValue && this.appraisedValue > 0) {
            this.coverageRatio = this.appraisedValue / (this.maxLoanAmount || 1);
        }

        // Calculate residual value if not set
        if (!this.residualValue && this.appraisedValue && this.age && this.depreciationRate) {
            const depreciation = (this.appraisedValue * this.depreciationRate * this.age) / 100;
            this.residualValue = Math.max(0, this.appraisedValue - depreciation);
        }

        // Calculate max loan amount based on LTV if not set
        if (!this.maxLoanAmount && this.appraisedValue && this.loanToValueRatio) {
            this.maxLoanAmount = (this.appraisedValue * this.loanToValueRatio) / 100;
        }

        // Calculate LTV if not set but max loan amount is set
        if (!this.loanToValueRatio && this.appraisedValue && this.appraisedValue > 0 && this.maxLoanAmount) {
            this.loanToValueRatio = (this.maxLoanAmount / this.appraisedValue) * 100;
        }
    }

    private handleStatusTransitions(): void {
        const now = new Date();

        // Handle release
        if (this.status === CollateralStatus.RELEASED && !this.releasedAt) {
            this.releasedAt = now;
        }

        // Handle seizure
        if (this.status === CollateralStatus.SEIZED && !this.seizedAt) {
            this.seizedAt = now;
        }

        // Handle sale
        if (this.status === CollateralStatus.SOLD && !this.soldAt) {
            this.soldAt = now;
        }

        // Handle damage
        if (this.status === CollateralStatus.DAMAGED && !this.damageDate) {
            this.damageDate = now;
        }
    }

    private checkInsuranceExpiry(): void {
        if (this.insuranceExpiryDate && new Date() > this.insuranceExpiryDate) {
            this.insuranceStatus = InsuranceStatus.INSURANCE_EXPIRED;
        }
    }

    private scheduleNextInspection(): void {
        if (!this.inspectionSchedule || !this.lastInspectionDate) {
            return;
        }

        const lastInspection = new Date(this.lastInspectionDate);
        const nextInspection = new Date(lastInspection);

        switch (this.inspectionSchedule) {
            case 'monthly':
                nextInspection.setMonth(nextInspection.getMonth() + 1);
                break;
            case 'quarterly':
                nextInspection.setMonth(nextInspection.getMonth() + 3);
                break;
            case 'semi_annually':
                nextInspection.setMonth(nextInspection.getMonth() + 6);
                break;
            case 'annually':
                nextInspection.setFullYear(nextInspection.getFullYear() + 1);
                break;
            default:
                return;
        }

        this.nextInspectionDate = nextInspection;
    }

    activate(): void {
        if (this.isActive) {
            throw new Error('Collateral is already active');
        }

        if (this.isReleased || this.isSeized || this.isSold || this.isDamaged || this.isLost) {
            throw new Error('Cannot activate collateral in current state');
        }

        this.status = CollateralStatus.ACTIVE;
    }

    release(reason: string): void {
        if (!this.isActive) {
            throw new Error('Only active collateral can be released');
        }

        this.status = CollateralStatus.RELEASED;
        this.statusChangeReason = reason;
        this.releasedAt = new Date();
    }

    seize(reason: string): void {
        if (!this.isActive) {
            throw new Error('Only active collateral can be seized');
        }

        this.status = CollateralStatus.SEIZED;
        this.statusChangeReason = reason;
        this.seizedAt = new Date();
    }

    sell(price: number, distribution: Record<string, number>, notes?: string): void {
        if (!this.isSeized) {
            throw new Error('Only seized collateral can be sold');
        }

        if (price <= 0) {
            throw new Error('Sale price must be greater than zero');
        }

        this.salePrice = price;
        this.saleProceedsDistribution = distribution;
        this.status = CollateralStatus.SOLD;
        this.soldAt = new Date();

        if (notes) {
            this.notes = notes;
        }
    }

    markAsDamaged(description: string, estimatedCost: number, claimNumber?: string): void {
        if (!this.isActive) {
            throw new Error('Only active collateral can be marked as damaged');
        }

        this.damageDescription = description;
        this.estimatedRepairCost = estimatedCost;
        this.insuranceClaimNumber = claimNumber;
        this.status = CollateralStatus.DAMAGED;
        this.damageDate = new Date();
        this.insuranceClaimStatus = claimNumber ? 'filed' : 'not_filed';
    }

    markAsLost(description: string, claimNumber?: string): void {
        if (!this.isActive) {
            throw new Error('Only active collateral can be marked as lost');
        }

        this.damageDescription = description;
        this.insuranceClaimNumber = claimNumber;
        this.status = CollateralStatus.LOST;
        this.damageDate = new Date();
        this.insuranceClaimStatus = claimNumber ? 'filed' : 'not_filed';
    }

    updateInsurance(
        company: string,
        policyNumber: string,
        coverageAmount: number,
        premium: number,
        expiryDate: Date,
        documentPath?: string,
    ): void {
        this.insuranceCompany = company;
        this.insurancePolicyNumber = policyNumber;
        this.insuranceCoverageAmount = coverageAmount;
        this.insurancePremium = premium;
        this.insuranceExpiryDate = expiryDate;
        this.insuranceDocumentPath = documentPath;
        this.insuranceStatus = InsuranceStatus.INSURED;
    }

    recordInspection(reportPath: string, findings?: string): void {
        this.lastInspectionDate = new Date();
        this.inspectionReportPath = reportPath;

        if (findings) {
            this.notes = (this.notes || '') + `\nInspection findings: ${findings}`;
        }

        // Schedule next inspection
        this.scheduleNextInspection();
    }

    updateAppraisal(value: number, currency: string = 'USD'): void {
        if (value <= 0) {
            throw new Error('Appraisal value must be greater than zero');
        }

        this.appraisedValue = value;
        this.currency = currency;
        this.calculateDerivedValues();
    }

    calculateRiskScore(): number {
        let score = 100; // Start with perfect score

        // Deduct for age
        if (this.ageInYears > 10) score -= 20;
        else if (this.ageInYears > 5) score -= 10;

        // Deduct for insurance
        if (!this.isInsured) score -= 30;
        else if (!this.hasAdequateInsurance) score -= 15;
        else if (this.isInsuranceExpired) score -= 25;

        // Deduct for condition
        if (this.condition === 'poor') score -= 20;
        else if (this.condition === 'fair') score -= 10;
        else if (this.condition === 'good') score -= 5;

        // Deduct for high depreciation
        if (this.depreciationRate && this.depreciationRate > 20) score -= 15;
        else if (this.depreciationRate && this.depreciationRate > 10) score -= 8;

        // Deduct for overdue inspection
        if (this.daysUntilNextInspection !== null && this.daysUntilNextInspection < 0) {
            score -= Math.min(20, Math.abs(this.daysUntilNextInspection) * 2);
        }

        // Ensure score stays within bounds
        return Math.max(0, Math.min(100, score));
    }

    getValueSummary(): {
        appraised: number;
        current: number;
        market: number;
        forcedSale: number;
        currency: string;
    } {
        return {
            appraised: this.appraisedValue,
            current: this.currentValue,
            market: this.marketValue || 0,
            forcedSale: this.forcedSaleValue || 0,
            currency: this.currency,
        };
    }

    getInsuranceSummary(): {
        status: string;
        company?: string;
        coverage: number;
        expiry?: Date;
        adequacy: number;
    } {
        return {
            status: this.insuranceStatus,
            company: this.insuranceCompany,
            coverage: this.insuranceCoverageAmount || 0,
            expiry: this.insuranceExpiryDate,
            adequacy: this.insuranceCoverageAdequacy,
        };
    }

    getInspectionSummary(): {
        last: Date;
        next: Date;
        overdue: boolean;
        daysUntil: number;
    } {
        return {
            last: this.lastInspectionDate,
            next: this.nextInspectionDate,
            overdue: this.daysUntilNextInspection !== null && this.daysUntilNextInspection < 0,
            daysUntil: this.daysUntilNextInspection || 0,
        };
    }

    // Utility methods
    toJSON(): any {
        const obj = { ...this };
        // Remove sensitive/internal fields
        delete obj.internalNotes;
        delete obj.deletedAt;
        delete obj.version;
        delete obj.metadata;
        delete obj.riskFactors;
        delete obj.riskMitigation;
        return obj;
    }

    toString(): string {
        return `LoanCollateral#${this.collateralNumber} (${this.collateralType})`;
    }

    get isRealEstate(): boolean {
        return this.collateralType === CollateralType.REAL_ESTATE;
    }

    get isVehicle(): boolean {
        return this.collateralType === CollateralType.VEHICLE;
    }

    get isLiquid(): boolean {
        return [
            CollateralType.SAVINGS_ACCOUNT,
            CollateralType.INVESTMENT_PORTFOLIO,
            CollateralType.ACCOUNTS_RECEIVABLE,
        ].includes(this.collateralType);
    }

    get requiresPhysicalStorage(): boolean {
        return [
            CollateralType.REAL_ESTATE,
            CollateralType.VEHICLE,
            CollateralType.EQUIPMENT,
            CollateralType.INVENTORY,
            CollateralType.JEWELRY,
            CollateralType.ART,
        ].includes(this.collateralType);
    }

    get requiresRegularInspection(): boolean {
        return this.requiresPhysicalStorage && !this.isRealEstate;
    }

    get documentationRequirements(): string[] {
        const requirements = ['ownership_proof', 'valuation_report'];

        if (this.isRealEstate) {
            requirements.push('title_deed', 'property_tax_receipt', 'survey_report');
        }

        if (this.isVehicle) {
            requirements.push('registration_certificate', 'insurance_certificate');
        }

        if (this.isInsured) {
            requirements.push('insurance_policy');
        }

        return requirements;
    }
}