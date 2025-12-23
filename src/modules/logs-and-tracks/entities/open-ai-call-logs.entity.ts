import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { OpenAiCallsType } from '@common/enums/open-ai-calls-type';

@Entity('open_ai_call_logs')
export class OpenAICallLogs extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: OpenAiCallsType })
  type: OpenAiCallsType;
}
