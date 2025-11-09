// Payment tracking model (TypeORM entity) - RazorPay integration
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenancy/tenant.model';
import { Subscription } from '../billing/subscription.model';

@Entity('payment_trackings')
export class PaymentTracking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid', nullable: true })
  subscription_id!: string | null;

  @Column({ type: 'varchar', length: 50 })
  plan_name!: string;

  @Column({ type: 'int' })
  users_count!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpay_order_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpay_payment_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpay_signature!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  payment_status!: string; // PENDING, SUCCESS, FAILED, REFUNDED

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  activation_status!: string; // PENDING, ACTIVATED, REJECTED

  @Column({ type: 'text', nullable: true })
  payment_response!: string | null; // JSON response from RazorPay

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: Subscription | null;
}

