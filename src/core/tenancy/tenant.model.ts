// Tenant model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../orgs/organization.model';
import { Domain } from '../orgs/domain.model';
import { Building } from '../orgs/building.model';
import { User } from '../users/user.model';
import { Admin } from '../admin/admin.model';
import { Subscription } from '../billing/subscription.model';
import { Invoice } from '../billing/invoice.model';
import { UsageEvent } from '../usage/usageEvent.model';
import { Notification } from '../notifications/notification.model';
import { Webhook } from '../webhooks/webhook.model';
import { AuditLog } from '../audit/auditLog.model';
import { PlatformAdmin } from '../platform/platformAdmin.model';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'uuid', nullable: true })
  plan_id!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_platform_admin!: string | null; // Super-Superadmin who created this tenant

  @Column({ type: 'uuid', nullable: true })
  super_admin_id!: string | null; // Superadmin assigned to this tenant (from admins table)

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @OneToMany(() => Organization, (org) => org.tenant)
  organizations!: Organization[];

  @OneToMany(() => Domain, (domain) => domain.tenant)
  domains!: Domain[];

  @OneToMany(() => Building, (building) => building.tenant)
  buildings!: Building[];

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];

  @OneToMany(() => Admin, (admin) => admin.tenant)
  admins!: Admin[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions!: Subscription[];

  @OneToMany(() => Invoice, (invoice) => invoice.tenant)
  invoices!: Invoice[];

  @OneToMany(() => UsageEvent, (event) => event.tenant)
  usageEvents!: UsageEvent[];

  @OneToMany(() => Notification, (notification) => notification.tenant)
  notifications!: Notification[];

  @OneToMany(() => Webhook, (webhook) => webhook.tenant)
  webhooks!: Webhook[];

  @OneToMany(() => AuditLog, (log) => log.tenant)
  auditLogs!: AuditLog[];

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'super_admin_id' })
  superAdmin!: Admin | null;

  @ManyToOne(() => PlatformAdmin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_platform_admin' })
  createdByPlatformAdmin!: PlatformAdmin | null;
}
