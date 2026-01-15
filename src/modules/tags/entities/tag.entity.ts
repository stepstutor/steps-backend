import {
  Entity,
  Column,
  OneToMany,
  // ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
// import { Problem } from '@modules/problems/entities/problem.entity';
import { ProblemTag } from '@modules/problems/entities/problem-tag.entity';

@Entity()
export class Tag extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // @ManyToMany(() => Problem, (problem) => problem.tags)
  // problems: Promise<Problem[]>;

  @OneToMany(() => ProblemTag, (problemTag) => problemTag.tag)
  problemTags: Promise<ProblemTag[]>;
}
