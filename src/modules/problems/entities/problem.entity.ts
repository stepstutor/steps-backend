import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  // JoinTable,
  DeleteDateColumn,
  // ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  Check,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
import { Course } from '@modules/courses/entities/course.entity';
import { User } from '@modules/user/entities/user.entity';
// import { Tag } from '@modules/tags/entities/tag.entity';

import { CourseProblemSettings } from '@modules/courses/entities/course-problem-settings.entity';

import { ProblemTag } from './problem-tag.entity';
import { ProblemLibrary } from './problem-library.entity';

@Entity()
@Check(
  '"isDraft" OR ("title" IS NOT NULL AND "description" IS NOT NULL AND "statement" IS NOT NULL AND "discipline" IS NOT NULL AND "essentialConcepts" IS NOT NULL AND "conceptsConnection" IS NOT NULL AND "commonMistakes" IS NOT NULL AND "additionalInformation" IS NOT NULL AND "instructorPlan" IS NOT NULL AND "solutionKey" IS NOT NULL AND "instructorId" IS NOT NULL)',
)
export class Problem extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  statement: string;

  @Column({ nullable: true })
  discipline: string;

  @Column({ type: 'text', nullable: true })
  essentialConcepts: string;

  @Column({ type: 'text', nullable: true })
  conceptsConnection: string;

  @Column({ type: 'text', nullable: true, default: null })
  assumptions: string;

  @Column({ type: 'text', nullable: true })
  commonMistakes: string;

  @Column({ type: 'text', nullable: true })
  additionalInformation: string;

  @Column({ type: 'text', nullable: true })
  instructorPlan: string;

  @Column({ type: 'text', nullable: true })
  solutionKey: string;

  @Column({ type: 'text', nullable: true, default: null })
  wrapUp: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  courseId: string;

  @Column({ default: false })
  isDraft: boolean;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid', nullable: true })
  instructorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  // @ManyToMany(() => Tag, (tag) => tag.problems, {})
  // @JoinTable({
  //   name: 'problem_tag',
  //   joinColumn: { name: 'problemId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  // })
  // tags: Promise<Tag[]>;

  @OneToMany(() => ProblemTag, (problemTag) => problemTag.problem)
  problemTags: Promise<ProblemTag[]>;

  @OneToOne(() => ProblemLibrary, (problemLibrary) => problemLibrary.problem)
  libraryEntry: Promise<ProblemLibrary | null>;

  @OneToOne(
    () => CourseProblemSettings,
    (courseProblemSettings) => courseProblemSettings.problem,
    { lazy: true },
  )
  courseProblemSettings: Promise<CourseProblemSettings | null>;

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
    | 'courseProblemSettings' // !-- Exclude relations not needed when creating a Problem
  >
> &
  Partial<
    Pick<
      Problem,
      | 'courseId'
      | 'assumptions'
      // | 'tags'
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
