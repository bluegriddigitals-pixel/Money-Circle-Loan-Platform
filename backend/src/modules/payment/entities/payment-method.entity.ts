import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PaymentMethodStatus, PaymentMethodType } from '../enums/payment-method.enum';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType
  })
  type: PaymentMethodType;

  @Column()
  lastFour: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  bankName: string;

  @Column()
  gatewayToken: string;

  @Column({ nullable: true })
  gatewayCustomerId: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column('jsonb', { nullable: true })
  billingAddress: any;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ nullable: true })
  expiryMonth: number;

  @Column({ nullable: true })
  expiryYear: number;

  @Column({
    type: 'enum',
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.PENDING
  })
  status: PaymentMethodStatus;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}