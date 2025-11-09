// Courier request model (TypeORM entity) - Employee-initiated requests
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
import { Courier } from './courier.model';

@Entity('courier_requests')
export class CourierRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20 })
  courier_type!: string; // INCOMING, OUTGOING

  @Column({ type: 'varchar', length: 200, nullable: true })
  intended_recipient!: string | null;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company_name!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  company_code!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'uuid', nullable: true })
  courier_id!: string | null; // Linked when receptionist creates courier

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Courier, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'courier_id' })
  courier!: Courier | null;
}

