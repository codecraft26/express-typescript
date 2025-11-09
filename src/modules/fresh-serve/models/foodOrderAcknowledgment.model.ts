// Food order acknowledgment model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FoodOrder } from './foodOrder.model';
import { User } from '../../../core/users/user.model';

@Entity('food_order_acknowledgments')
export class FoodOrderAcknowledgment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  order_id!: string;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by!: string | null;

  @Column({ type: 'boolean', default: false })
  check_in_popup!: boolean;

  @Column({ type: 'text', nullable: true })
  digital_signature!: string | null; // Base64 encoded signature

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => FoodOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: FoodOrder;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedBy!: User | null;
}

