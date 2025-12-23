import { Article } from './article.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

@Entity()
export class ArticleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  order: number;

  @OneToMany(() => Article, (article) => article.articleCategory)
  articles: Article[];
}
