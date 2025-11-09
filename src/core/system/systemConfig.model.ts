// System configuration model (TypeORM entity) - Dynamic config values
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

@Entity('system_configs')
@Unique(['tenant_id', 'config_key'])
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id!: string | null; // null for global configs

  @Column({ type: 'varchar', length: 100 })
  config_key!: string;

  @Column({ type: 'text', nullable: true })
  config_value!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  config_type!: string | null; // STRING, NUMBER, BOOLEAN, JSON

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;
}

