// Design configuration model (TypeORM entity)
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

@Entity('design_configs')
export class DesignConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company_name!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hero_image_url!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  section_title!: string | null;

  @Column({ type: 'text', nullable: true })
  module_text!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  primary_cta_color!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  secondary_cta_color!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme!: string; // light, dark

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}

