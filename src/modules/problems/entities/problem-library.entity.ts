import {
  Column,
  Entity,
  Unique,
  OneToOne,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { Institution } from '@modules/institutions/entities/institutions.entity';

import { Problem } from './problem.entity';

@Entity('problem_library')
@Unique(['problemId', 'institutionId'])
export class ProblemLibrary extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  problemId: string;

  @OneToOne(() => Problem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: Problem;

  @Column({ type: 'uuid', nullable: true, default: null })
  institutionId: string | null;

  @ManyToOne(() => Institution, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institutionId' })
  institution: Institution | null;

  @Column({ type: 'uuid' })
  instructorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;
}
