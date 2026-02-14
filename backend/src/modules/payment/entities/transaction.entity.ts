import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    BeforeInsert,
    OneToMany, // Add this if you want the inverse relation
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
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
    IsObject,
} from 'class-validator';
import { DecimalColumn } from '../../../shared/decorators/decimal-column.decorator';
import { Loan } from '../../loan/entities/loan.entity';
import { EscrowAccount } from './escrow-account.entity';
import { PaymentMethod } from './payment-method.entity';
import { PayoutRequest } from './payout-request.entity'; // Add this import

// ============================================
// IMPORT ENUMS FROM ENUMS FOLDER - NOT DEFINED HERE
// ============================================
import { 
    TransactionType, 
    TransactionStatus 
} from '../enums/transaction.enum';

@Entity('transactions')
@Index(['transactionNumber'], { unique: true })
@Index(['loanId'])
@Index(['escrowAccountId'])
@Index(['paymentMethodId'])
@Index(['payoutRequestId']) // Add index for payoutRequestId
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Transaction {
    @ApiProperty({
        description: 'Unique identifier for the transaction',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4')
    id: string;

    @ApiProperty({
        description: 'Unique transaction number',
        example: 'TXN-2024-001234',
        readOnly: true,
    })
    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    @IsString()
    @IsNotEmpty()
    transactionNumber: string;

    @ApiPropertyOptional({
        description: 'ID of the associated loan',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    loanId: string;

    @ApiPropertyOptional({
        description: 'ID of the associated escrow account',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    escrowAccountId: string;

    @ApiPropertyOptional({
        description: 'ID of the payment method used',
        example: '123e4567-e89b-12d3-a456-426614174003',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    paymentMethodId: string;

    @ApiPropertyOptional({
        description: 'ID of the associated payout request',
        example: '123e4567-e89b-12d3-a456-426614174004',
    })
    @Column({ type: 'uuid', nullable: true }) // Add this column
    @IsOptional()
    @IsUUID('4')
    payoutRequestId: string;

    @ApiPropertyOptional({
        description: 'User ID who initiated the transaction',
        example: '123e4567-e89b-12d3-a456-426614174005',
    })
    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID('4')
    userId: string;

    @ApiProperty({
        description: 'Transaction type',
        enum: TransactionType,
        example: TransactionType.DEPOSIT,
    })
    @Column({
        type: 'enum',
        enum: TransactionType,
        nullable: false,
    })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({
        description: 'Transaction status',
        enum: TransactionStatus,
        example: TransactionStatus.COMPLETED,
        default: TransactionStatus.PENDING,
    })
    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
        nullable: false,
    })
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @ApiProperty({
        description: 'Transaction amount',
        example: 1000.00,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: false })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({
        description: 'Transaction currency',
        example: 'USD',
        default: 'USD',
    })
    @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
    @IsString()
    currency: string;

    @ApiPropertyOptional({
        description: 'Transaction description',
        example: 'Loan disbursement for loan #LN-2024-001',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    description: string;

    @ApiPropertyOptional({
        description: 'External transaction reference',
        example: 'ch_123456789',
    })
    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsString()
    transactionReference: string;

    @ApiPropertyOptional({
        description: 'Transaction fee',
        example: 25.00,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fee: number;

    @ApiPropertyOptional({
        description: 'Processing fee',
        example: 2.50,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    processingFee: number;

    @ApiPropertyOptional({
        description: 'Tax amount',
        example: 0.25,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    tax: number;

    @ApiPropertyOptional({
        description: 'Net amount (amount - fees)',
        example: 972.25,
        minimum: 0,
    })
    @DecimalColumn({ precision: 15, scale: 2, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    netAmount: number;

    @ApiPropertyOptional({
        description: 'Transaction metadata',
        example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    })
    @Column({ type: 'jsonb', nullable: true })
    @IsOptional()
    @IsObject()
    metadata: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Failure reason if transaction failed',
        example: 'Insufficient funds',
    })
    @Column({ type: 'text', nullable: true })
    @IsOptional()
    @IsString()
    failureReason: string;

    @ApiPropertyOptional({
        description: 'Processing date',
    })
    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    processedAt: Date;

    @ApiProperty({
        description: 'Transaction creation timestamp',
        readOnly: true,
    })
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        readOnly: true,
    })
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ApiHideProperty()
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;

    // Relations
    @ManyToOne(() => Loan, (loan) => loan.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'loanId' })
    loan: Loan;

    @ManyToOne(() => EscrowAccount, (escrow) => escrow.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'escrowAccountId' })
    escrowAccount: EscrowAccount;

    @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'paymentMethodId' })
    paymentMethod: PaymentMethod;

    @ManyToOne(() => PayoutRequest, (payoutRequest) => payoutRequest.transactions, { // Add this relation
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'payoutRequestId' })
    payoutRequest: PayoutRequest;

    // Lifecycle hooks
    @BeforeInsert()
    generateTransactionNumber() {
        if (!this.transactionNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            this.transactionNumber = `TXN-${year}-${random}`;
        }
    }

    // Virtual properties
    @ApiProperty({
        description: 'Is transaction completed',
        example: true,
        readOnly: true,
    })
    @Expose()
    get isCompleted(): boolean {
        return this.status === TransactionStatus.COMPLETED;
    }

    @ApiProperty({
        description: 'Is transaction pending',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isPending(): boolean {
        return this.status === TransactionStatus.PENDING;
    }

    @ApiProperty({
        description: 'Is transaction failed',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isFailed(): boolean {
        return this.status === TransactionStatus.FAILED;
    }

    @ApiProperty({
        description: 'Is transaction refunded',
        example: false,
        readOnly: true,
    })
    @Expose()
    get isRefunded(): boolean {
        return this.status === TransactionStatus.REFUNDED;
    }
}