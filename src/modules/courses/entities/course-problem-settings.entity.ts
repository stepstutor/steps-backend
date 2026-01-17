import {
  Entity,
  Column,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import { Course } from './course.entity';
import { Base } from '@common/entities/base.entity';
import { Problem } from '@modules/problems/entities/problem.entity';

@Entity()
export class CourseProblemSettings extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  hasPlanning: boolean;

  @Column({ default: false })
  hasReflection: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  planningReleaseDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  planningDueDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reflectionReleaseDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reflectionDueDate: Date | null;

  @Column({ default: false })
  isOptional: boolean;

  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'uuid', nullable: false })
  problemId: string;

  @Column({ nullable: false, default: false })
  requireSolution: boolean;

  @ManyToOne(() => Course, (course) => course.problemSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => Problem, (problem) => problem.courseProblemSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'problemId' })
  problem: Problem;
}
