// Visitor activity log model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Visitor } from './visitor.model';
import { User } from '../../../core/users/user.model';

@Entity('visitor_activity_logs')
export class VisitorActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  visitor_id!: string;

  @Column({ type: 'uuid', nullable: true })
  action_by!: string | null;

  @Column({ type: 'varchar', length: 100 })
  action!: string; // CHECK_IN, CHECK_OUT, STATUS_CHANGE, etc.

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', nullable: true })
  metadata!: string | null; // JSON metadata

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => Visitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor!: Visitor;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'action_by' })
  actionBy!: User | null;
}

