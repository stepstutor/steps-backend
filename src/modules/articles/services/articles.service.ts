import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Role } from '@common/enums/userRole';

import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticleCategoriesService } from './articleCategory.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly articleCategoryService: ArticleCategoriesService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const maxOrder = await this.articleRepository
      .createQueryBuilder('article')
      .select('MAX(article.order)', 'max')
      .where('article.articleCategoryId = :articleCategoryId', {
        articleCategoryId: createArticleDto.articleCategoryId,
      })
      .getRawOne();

    const article = this.articleRepository.create({
      ...createArticleDto,
      order: (maxOrder?.max || 0) + 1,
    });

    return await this.articleRepository.save(article);
  }

  async findAll(
    userRole?: Role,
    search?: string,
    articleCategoryId?: string,
  ): Promise<Article[]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.articleCategory', 'articleCategory');

    if (userRole && userRole !== Role.SUPER_ADMIN) {
      query.andWhere(':userRole = ANY(article.availableFor)', { userRole });
    }

    if (search) {
      query.andWhere(
        '(article.title ILIKE :search OR articleCategory.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (articleCategoryId) {
      query.andWhere('article.articleCategoryId = :articleCategoryId', {
        articleCategoryId,
      });
    }

    return await query.orderBy('article.order', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['articleCategory'],
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(id);
    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async remove(id: string): Promise<{ message: string }> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
    return { message: 'Article deleted successfully' };
  }

  async reorder(
    articleCategoryId: string,
    articles: { id: string; order: number }[],
  ): Promise<{ message: string }> {
    await this.articleRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const articleCategory =
          await this.articleCategoryService.findOne(articleCategoryId);
        if (!articleCategory) {
          throw new NotFoundException('Article category not found');
        }
        await Promise.all(
          articles.map((article) =>
            transactionalEntityManager.update(
              Article,
              { id: article.id, articleCategoryId },
              { order: article.order },
            ),
          ),
        );
      },
    );
    return { message: 'Articles reordered successfully' };
  }
}
