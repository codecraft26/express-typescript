// Platform admin model (TypeORM entity) - Super-Superadmin at platform level
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
import { Tenant } from '../tenancy/tenant.model';

@Entity('platform_admins')
export class PlatformAdmin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 80 })
  first_name!: string;

  @Column({ type: 'varchar', length: 80 })
  last_name!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by!: string | null; // Another platform admin who created this

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @OneToMany(() => Tenant, (tenant) => tenant.createdByPlatformAdmin, { nullable: true })
  createdTenants!: Tenant[];

  @ManyToOne(() => PlatformAdmin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: PlatformAdmin | null;
}

