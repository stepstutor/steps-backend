import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

import { Tag } from '@modules/tags/entities/tag.entity';

import { Problem } from './problem.entity';

@Entity('problem_tag')
export class ProblemTag {
  @PrimaryColumn({ type: 'uuid' })
  problemId: string;

  @PrimaryColumn({ type: 'uuid' })
  tagId: string;

  @ManyToOne(() => Problem, (problem) => problem.problemTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'problemId' })
  problem: Promise<Problem>;

  @ManyToOne(() => Tag, (tag) => tag.problemTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Promise<Tag>;
}
