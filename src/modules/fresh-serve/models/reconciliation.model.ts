// Reconciliation model (TypeORM entity)
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
import { User } from '../../../core/users/user.model';

@Entity('reconciliations')
export class Reconciliation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 50 })
  reconciliation_type!: string; // READY_TO_EAT, RAW_FOOD, FRESH_OUTSOURCED, INVENTORY

  @Column({ type: 'uuid', nullable: true })
  item_id!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  item_name!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_used!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity_wastage!: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  requisitioner_name!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  requisitioner_employee_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  reconciled_by!: string | null;

  @Column({ type: 'date' })
  reconciliation_date!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reconciled_by' })
  reconciler!: User | null;
}

