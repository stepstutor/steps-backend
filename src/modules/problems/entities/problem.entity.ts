import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  JoinTable,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
import { Course } from '@modules/courses/entities/course.entity';
import { User } from '@modules/user/entities/user.entity';
import { Tag } from '@modules/tags/entities/tag.entity';

import { ProblemTag } from './problem-tag.entity';
import { ProblemLibrary } from './problem-library.entity';

@Entity()
export class Problem extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'text' })
  statement: string;

  @Column()
  discipline: string;

  @Column({ type: 'text' })
  essentialConcepts: string;

  @Column({ type: 'text' })
  conceptsConnection: string;

  @Column({ type: 'text', nullable: true, default: null })
  assumptions: string;

  @Column({ type: 'text' })
  commonMistakes: string;

  @Column({ type: 'text' })
  additionalInformation: string;

  @Column({ type: 'text' })
  instructorPlan: string;

  @Column({ type: 'text' })
  solutionKey: string;

  @Column({ type: 'text', nullable: true, default: null })
  wrapUp: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  courseId: string;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid' })
  instructorId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @ManyToMany(() => Tag, (tag) => tag.problems)
  @JoinTable({
    name: 'problem_tag',
    joinColumn: { name: 'problemId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Promise<Tag[]>;

  @OneToMany(() => ProblemTag, (problemTag) => problemTag.problem)
  problemTags: Promise<ProblemTag[]>;

  @OneToOne(() => ProblemLibrary, (problemLibrary) => problemLibrary.problem)
  libraryEntry: Promise<ProblemLibrary | null>;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}

export type CreateProblemData = Required<
  Omit<
    Problem,
    | 'courseId'
    | 'assumptions'
    | 'tags'
    | 'deletedAt'
    | 'libraryEntry'
    | 'id'
    | 'course'
    | 'instructor'
    | 'createdAt'
    | 'updatedAt'
    | 'createdBy'
    | 'updatedBy'
    | 'problemTags' // !-- Exclude relations not needed when creating a Problem
  >
> &
  Partial<
    Pick<
      Problem,
      | 'courseId'
      | 'assumptions'
      | 'tags'
      | 'deletedAt'
      | 'libraryEntry'
      | 'id'
      | 'course'
      | 'instructor'
      | 'createdAt'
      | 'updatedAt'
      | 'createdBy'
      | 'updatedBy'
    >
  >;
