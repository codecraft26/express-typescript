// Food order model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../../core/tenancy/tenant.model';
import { User } from '../../../core/users/user.model';
import { MenuItem } from './menuItem.model';

@Entity('food_orders')
@Index(['tenant_id'])
export class FoodOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  admin_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  menu_item_id!: string | null;

  @Column({ type: 'int', nullable: true })
  quantity!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_amount!: number | null;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  admin_notes!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qr_code_link!: string | null; // QR code with room/table/cabin info

  @Column({ type: 'varchar', length: 100, nullable: true })
  requisitioner_name!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  requisitioner_employee_id!: string | null;

  @Column({ type: 'boolean', default: false })
  is_acknowledged!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at!: Date | null;

  @Column({ type: 'boolean', default: false })
  is_recurring!: boolean;

  @Column({ type: 'text', nullable: true })
  recurring_pattern!: string | null; // JSON pattern

  @Column({ type: 'int', default: 0 })
  recurring_count!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employee_grade!: string | null; // For grade-based menu access

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin!: User | null;

  @ManyToOne(() => MenuItem, (item) => item.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem!: MenuItem | null;
}

