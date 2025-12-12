import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { InstructorType } from '@common/enums/instructorType';

import { Course } from './course.entity';

@Entity()
export class CourseInstructor extends Base {
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
  instructorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'instructorId',
  })
  instructor: Promise<User>;

  @Column({ type: 'enum', enum: InstructorType })
  instructorType: InstructorType;
}
