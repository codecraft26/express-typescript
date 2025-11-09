// Usage event model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../tenancy/tenant.model';

@Entity('usage_events')
@Index(['tenant_id'])
export class UsageEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  module_scope: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  metric_key: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  recorded_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.usageEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
