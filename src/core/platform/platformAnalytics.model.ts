// Platform analytics model (TypeORM entity) - Cross-tenant analytics for super-superadmin
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('platform_analytics')
export class PlatformAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  analytics_date!: Date;

  @Column({ type: 'int', default: 0 })
  total_tenants!: number;

  @Column({ type: 'int', default: 0 })
  active_tenants!: number;

  @Column({ type: 'int', default: 0 })
  total_users!: number;

  @Column({ type: 'int', default: 0 })
  active_users!: number;

  @Column({ type: 'int', default: 0 })
  total_admins!: number;

  @Column({ type: 'int', default: 0 })
  total_super_admins!: number;

  @Column({ type: 'text', nullable: true })
  tenant_breakdown!: string | null; // JSON: { tenant_id: { users: 10, admins: 2 } }

  @Column({ type: 'text', nullable: true })
  module_usage!: string | null; // JSON: { DWAR: 100, SAMMILAN: 50, etc. }

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;
}

