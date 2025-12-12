import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ReceiverGroup } from '../../../common/enums/notificationReceiverGroup';

@Entity()
export class NotificationJob extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  linkUrl: string;

  @Column({ nullable: true })
  linkText: string;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'enum', enum: ReceiverGroup })
  receiverGroup: ReceiverGroup;

  @Column({ type: 'simple-array', nullable: true })
  receiverCountry: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  receiverInstituteIds: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  receiverCourseIds: string[] | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduleDate: Date | null;

  @Column({ default: false })
  sendEmail: boolean;

  @Column({ nullable: true })
  queueJobId: string;
}
