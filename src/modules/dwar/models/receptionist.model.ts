// Receptionist model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../core/tenancy/tenant.model';
import { Building } from '../../../core/orgs/building.model';
import { Floor } from '../../../core/orgs/floor.model';
import { User } from '../../../core/users/user.model';

@Entity('receptionists')
export class Receptionist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null; // Link to user if exists

  @Column({ type: 'varchar', length: 100 })
  full_name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employee_id!: string | null;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile_number!: string | null;

  @Column({ type: 'uuid', nullable: true })
  building_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  floor_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assigned_location!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  approval_status!: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'varchar', length: 255, nullable: true })
  temporary_password!: string | null;

  @Column({ type: 'boolean', default: false })
  password_changed!: boolean;

  @Column({ type: 'date', nullable: true })
  access_start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  access_end_date!: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @ManyToOne(() => Building, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'building_id' })
  building!: Building | null;

  @ManyToOne(() => Floor, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'floor_id' })
  floor!: Floor | null;
}

