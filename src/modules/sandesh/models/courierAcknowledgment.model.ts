// Courier acknowledgment model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Courier } from './courier.model';
import { User } from '../../../core/users/user.model';

@Entity('courier_acknowledgments')
export class CourierAcknowledgment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  courier_id!: string;

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
  @ManyToOne(() => Courier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courier_id' })
  courier!: Courier;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedBy!: User | null;
}

