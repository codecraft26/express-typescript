// Inventory item model (TypeORM entity)
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

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 100 })
  item_name!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string; // Raw Material, Packaged, Beverage, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'varchar', length: 20 })
  unit!: string; // g, kg, litre, piece, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  threshold_limit!: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vendor_name!: string | null;

  @Column({ type: 'date', nullable: true })
  purchase_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  expiry_date!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'IN_STOCK' })
  status!: string; // IN_STOCK, OUT_OF_STOCK

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}

