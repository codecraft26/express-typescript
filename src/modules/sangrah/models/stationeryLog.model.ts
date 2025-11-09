// Stationery log model (TypeORM entity)
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

@Entity('stationery_logs')
export class StationeryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  request_id: string;

  @Column({ type: 'uuid', nullable: true })
  action_by: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  // Relations
  @ManyToOne(() => StationeryRequest, (request) => request.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: StationeryRequest;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'action_by' })
  actionBy: User;
}
