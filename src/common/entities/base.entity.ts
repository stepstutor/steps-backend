import * as crypto from 'crypto';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class Base {
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  createdBy: crypto.UUID;

  @Column({ type: 'uuid', nullable: true, default: null })
  updatedBy: crypto.UUID;
}
