import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Base } from '@common/entities/base.entity';
import { UploadType } from '@common/enums/upload-type';

import { Problem } from './problem.entity';

@Entity('problem_uploads')
export class ProblemUpload extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  problemId: string;

  @ManyToOne(() => Problem, (problem) => problem.problemUploads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'problemId' })
  problem: Problem;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'enum', enum: UploadType })
  uploadType: UploadType;
}
