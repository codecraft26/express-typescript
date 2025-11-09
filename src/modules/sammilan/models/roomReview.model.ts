// Room review/rating model (TypeORM entity)
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
import { MeetingRoom } from './meetingRoom.model';
import { User } from '../../../core/users/user.model';

@Entity('room_reviews')
export class RoomReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  meeting_id!: string;

  @Column({ type: 'uuid', nullable: true })
  room_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by!: string | null;

  @Column({ type: 'int', nullable: true })
  rating!: number | null; // 1-5 scale

  @Column({ type: 'text', nullable: true })
  comments!: string | null;

  @Column({ type: 'text', nullable: true })
  questionnaire_responses!: string | null; // JSON responses

  @Column({ type: 'varchar', length: 20, nullable: true })
  review_type!: string | null; // HOST_TO_ADMIN, ADMIN_TO_HOST, HOST_TO_ROOM

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()', onUpdate: 'NOW()' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Meeting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting!: Meeting;

  @ManyToOne(() => MeetingRoom, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room!: MeetingRoom | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: User | null;
}

