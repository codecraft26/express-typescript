// Organization registration model (TypeORM entity) - SaaS enablement
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

@Entity('organization_registrations')
export class OrganizationRegistration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  organization_name!: string;

  @Column({ type: 'varchar', length: 100 })
  contact_person_name!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'int' })
  max_employees!: number;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  approval_status!: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  tenant_id!: string | null; // Created tenant after approval

  @Column({ type: 'uuid', nullable: true })
  reviewed_by!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;
}

