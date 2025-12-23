import { Role } from '@common/enums/userRole';
import { ArticleCategory } from './article-category.entity';
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ length: 600 })
  blogInput: string;

  @Column({ type: 'character varying', nullable: true })
  video: string | null;

  @Column({ type: 'character varying', nullable: true })
  image: string | null;

  @Column({ type: 'uuid', nullable: false })
  articleCategoryId: string;

  @ManyToOne(() => ArticleCategory, (category) => category.articles)
  articleCategory: ArticleCategory;

  @Column()
  order: number;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
  })
  availableFor: Role[];
}
