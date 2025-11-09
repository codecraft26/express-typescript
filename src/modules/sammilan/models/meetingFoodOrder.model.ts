// Meeting food order model (TypeORM entity) - FBS integration
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Meeting } from './meeting.model';
import { Tenant } from '../../../core/tenancy/tenant.model';

@Entity('meeting_food_orders')
export class MeetingFoodOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  meeting_id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'text' })
  items!: string; // JSON array of food items

  @Column({ type: 'int', default: 0 })
  total_quantity!: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: string; // PENDING, CONFIRMED, DELIVERED, CANCELLED

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Meeting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting!: Meeting;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}

