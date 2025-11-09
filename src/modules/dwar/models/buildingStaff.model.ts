// Building staff model (TypeORM entity)
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

@Entity('building_staff')
export class BuildingStaff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 100 })
  employee_code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_number!: string;

  @Column({ type: 'uuid', nullable: true })
  building_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  floor_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area!: string | null;

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

  @ManyToOne(() => Building, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'building_id' })
  building!: Building | null;

  @ManyToOne(() => Floor, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'floor_id' })
  floor!: Floor | null;
}

