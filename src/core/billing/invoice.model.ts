// Invoice model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenancy/tenant.model';
import { Subscription } from './subscription.model';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  subscription_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_ref: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  issued_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Subscription, (subscription) => subscription.invoices, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
