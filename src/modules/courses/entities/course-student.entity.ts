import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Base } from '@common/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity()
export class CourseStudent extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({
    name: 'courseId',
  })
  course: Promise<Course>;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'studentId',
  })
  student: Promise<User>;
}
