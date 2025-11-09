// Admin onboarding request model (TypeORM entity)
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
import { Admin } from './admin.model';

@Entity('admin_onboarding_requests')
export class AdminOnboardingRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  employee_id!: string | null; // If admin signs up with existing employee ID

  @Column({ type: 'varchar', length: 80, nullable: true })
  first_name!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  last_name!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  approval_status!: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  admin_id!: string | null; // Created admin after approval

  @Column({ type: 'uuid', nullable: true })
  approved_by!: string | null; // Super Admin who approved

  @Column({ type: 'uuid', nullable: true })
  created_by!: string | null; // Super Admin who created (if created directly)

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin!: Admin | null;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approver!: Admin | null;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: Admin | null;
}

