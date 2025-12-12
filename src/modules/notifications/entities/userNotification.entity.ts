import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { NotificationJob } from './notification.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class UserNotification extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  notificationId: string;

  @Column()
  title: string;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  linkUrl: string;

  @Column({ nullable: true })
  linkText: string;

  @ManyToOne(() => NotificationJob, { nullable: false, lazy: true })
  @JoinColumn({ name: 'notificationId' })
  notification: Promise<NotificationJob>;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false, lazy: true })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  seenAt: Date | null;
}
