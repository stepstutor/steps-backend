import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from '@common/enums/userRole';
import { Base } from '@common/entities/base.entity';
import { Query } from '../../queries/entities/query.entity';
import { Institution } from '@modules/institutions/entities/institutions.entity';

@Entity()
export class User extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  profilePic: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ nullable: true, default: '' })
  supabaseUid: string;

  @Column({ type: 'jsonb', nullable: true })
  walkthroughScreens: string[];

  @Column({ type: 'uuid', nullable: true, default: null })
  institutionId: string | null;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({
    name: 'institutionId',
  })
  institution: Promise<Institution | null>;

  @OneToMany(() => Query, (query) => query.user)
  queries: Query[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
