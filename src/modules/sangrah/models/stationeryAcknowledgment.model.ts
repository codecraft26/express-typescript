// Stationery acknowledgment model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StationeryRequest } from './stationeryRequest.model';
import { User } from '../../../core/users/user.model';

@Entity('stationery_acknowledgments')
export class StationeryAcknowledgment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  request_id!: string;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by!: string | null;

  @Column({ type: 'text' })
  received_items!: string; // JSON array

  @Column({ type: 'varchar', length: 20 })
  condition!: string; // GOOD, DAMAGED

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => StationeryRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request!: StationeryRequest;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedBy!: User | null;
}

