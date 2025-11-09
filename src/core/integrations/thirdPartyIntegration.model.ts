// Third-party integration model (TypeORM entity)
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

@Entity('third_party_integrations')
export class ThirdPartyIntegration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 50 })
  integration_type!: string; // Happay, ClearTax, GRIMS, Keka, Slack

  @Column({ type: 'varchar', length: 200, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sso_url!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  api_key!: string | null;

  @Column({ type: 'text', nullable: true })
  config!: string | null; // JSON config

  @Column({ type: 'boolean', default: false })
  is_enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  sso_enabled!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}

