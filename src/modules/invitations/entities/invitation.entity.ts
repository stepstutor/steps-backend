import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from '@common/enums/userRole';
import { Base } from '@common/entities/base.entity';
import { Institution } from '@modules/institutions/entities/institutions.entity';

@Entity()
export class Invitation extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'uuid', nullable: true, default: null })
  institutionId: string | null;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({
    name: 'institutionId',
  })
  institution: Institution | null;

  @Column({
    type: 'timestamptz',
  })
  expireAt: Date;
}
