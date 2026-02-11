import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
  IsDate,
} from 'class-validator';

export enum NotificationType {
  TRANSACTION = 'transaction',
  PAYOUT = 'payout',
  DISBURSEMENT = 'disbursement',
  ESCROW = 'escrow',
  LOAN = 'loan',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('notifications')
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class Notification {
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'User ID who receives the notification',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column({ type: 'uuid', nullable: false })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.TRANSACTION,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: false,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification channel',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
    nullable: false,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Notification title',
    example: 'Transaction Completed',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification content',
    example: 'Your payment of $100.00 was successful',
  })
  @Column({ type: 'text', nullable: false })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Notification data payload',
    example: { transactionId: 'txn_123', amount: 100 },
  })
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({
    description: 'Notification status',
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
    default: NotificationStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    nullable: false,
  })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @ApiPropertyOptional({
    description: 'When the notification was read',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  readAt: Date;

  @ApiPropertyOptional({
    description: 'When the notification was delivered',
  })
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  deliveredAt: Date;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({
    description: 'Notification creation timestamp',
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
}