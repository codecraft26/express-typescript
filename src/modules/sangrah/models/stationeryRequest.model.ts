// Stationery request model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Tenant } from '../../../core/tenancy/tenant.model';
import { User } from '../../../core/users/user.model';
import { Building } from '../../../core/orgs/building.model';
import { Floor } from '../../../core/orgs/floor.model';
import { StationeryItem } from './stationeryItem.model';
import { StationeryLog } from './stationeryLog.model';

@Entity('stationery_requests')
@Index(['tenant_id'])
export class StationeryRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @Column({ type: 'uuid', nullable: true })
  admin_id: string;

  @Column({ type: 'uuid', nullable: true })
  building_id: string;

  @Column({ type: 'uuid', nullable: true })
  floor_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @Column({ type: 'uuid', nullable: true })
  department_head_id!: string | null; // For department head approval

  @Column({ type: 'varchar', length: 20, nullable: true })
  department_head_approval_status!: string | null; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  department_head_comments!: string | null;

  @Column({ type: 'date', nullable: true })
  required_by_date!: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fulfillment_status!: string | null; // FULFILLED, PARTIAL, BACKORDER

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StationeryItem, (item) => item.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: StationeryItem;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @ManyToOne(() => Building, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @ManyToOne(() => Floor, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @OneToMany(() => StationeryLog, (log) => log.request)
  logs: StationeryLog[];
}
