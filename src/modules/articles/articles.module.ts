import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Article } from './entities/article.entity';
import { ArticlesService } from './services/articles.service';
import { ArticleCategory } from './entities/article-category.entity';
import { ArticlesController } from './controllers/articles.controller';
import { ArticleCategoriesService } from './services/articleCategory.service';
import { ArticleCategoryController } from './controllers/articleCategories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleCategory])],
  controllers: [ArticlesController, ArticleCategoryController],
  providers: [ArticlesService, ArticleCategoriesService],
})
export class ArticlesModule {}
