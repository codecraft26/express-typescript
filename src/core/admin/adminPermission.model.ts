// Admin permission model (TypeORM entity) - Granular permissions for admins
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Tenant } from '../tenancy/tenant.model';
import { Admin } from './admin.model';

@Entity('admin_permissions')
@Unique(['tenant_id', 'admin_id', 'permission_key'])
export class AdminPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  admin_id!: string;

  @Column({ type: 'varchar', length: 100 })
  permission_key!: string; // e.g., 'MODULE_CONFIG', 'DESIGN_CONFIG', 'ANNOUNCEMENTS', 'ANALYTICS', etc.

  @Column({ type: 'boolean', default: true })
  is_granted!: boolean;

  @Column({ type: 'uuid', nullable: true })
  granted_by!: string | null; // Super Admin who granted this permission (from admins table)

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin!: Admin;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'granted_by' })
  granter!: Admin | null;
}

