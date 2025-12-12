// **** Library Imports ****
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

// **** External Imports ****
import { Language } from '@common/enums/language';
import { Base } from '@common/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { Course } from '@modules/courses/entities/course.entity';

@Entity()
export class Institution extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isVoiceCallAllowed: boolean;

  @Column({ type: 'enum', enum: Language, default: Language.EN })
  language: Language;

  @Column({ type: 'int', default: 10 })
  instructorAccountsLimit: number;

  @Column({ type: 'int', default: 20 })
  studentAccountsLimit: number;

  @OneToMany(() => User, (user) => user.institution, {
    cascade: true,
    eager: false,
  })
  users: Promise<User[]>;

  @OneToMany(() => Course, (course) => course.institution, {
    cascade: true,
    eager: false,
  })
  courses: Promise<Course[]>;

  @Column({ default: false })
  isResearch: boolean;
}
