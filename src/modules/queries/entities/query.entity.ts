import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';

@Entity('queries')
export class Query {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.queries, { eager: true }) // Eager loading ensures the user is always fetched
  @JoinColumn({ name: 'userId' }) // Specifies the foreign key column
  user: User;

  @Column({ type: 'int', unique: true })
  referenceNumber: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  pictureUrl?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Open',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
