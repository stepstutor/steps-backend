// **** Library Imports ****
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

// **** External Imports ****
import { Base } from '@common/entities/base.entity';
import { StudentYear } from '@common/enums/studentYear';
import { Institution } from '@modules/institutions/entities/institutions.entity';

// **** Internal Imports ****
import { CourseStudent } from './course-student.entity';
import { CourseInstructor } from './course-instructor.entity';
import { CourseProblemSettings } from './course-problem-settings.entity';

@Entity()
export class Course extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  timePeriod: string;

  @Column()
  courseColor: string;

  @Column({ default: 'Medicine' })
  programOfCourse: string;

  @Column({
    type: 'enum',
    enum: StudentYear,
    default: null,
    nullable: true,
  })
  yearOfStudent: StudentYear | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true, default: null })
  institutionId: string | null;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({
    name: 'institutionId',
  })
  institution: Promise<Institution | null>;

  @OneToMany(
    () => CourseInstructor,
    (courseInstructor) => courseInstructor.course,
  )
  courseInstructors: Promise<CourseInstructor[]>;

  @OneToMany(() => CourseStudent, (courseStudent) => courseStudent.course)
  courseStudents: Promise<CourseStudent[]>;

  @OneToOne(
    () => CourseProblemSettings,
    (problemSettings) => problemSettings.course,
  )
  problemSettings: Promise<CourseProblemSettings | null>;
}
