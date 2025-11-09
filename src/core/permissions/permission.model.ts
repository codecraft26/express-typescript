// Permission model (TypeORM entity)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Role } from '../roles/role.model';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  module: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relations
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
