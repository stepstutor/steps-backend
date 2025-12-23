import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Role } from '@common/enums/userRole';

import { ArticleCategory } from '../entities/article-category.entity';
import { CreateArticleCategoryDto } from '../dto/create-categoryArticle.dto';
import { UpdateArticleCategoryDto } from '../dto/update-categoryArticle.dto';

@Injectable()
export class ArticleCategoriesService {
  constructor(
    @InjectRepository(ArticleCategory)
    private readonly categoryRepository: Repository<ArticleCategory>,
  ) {}

  async create(
    createCategoryDto: CreateArticleCategoryDto,
  ): Promise<ArticleCategory> {
    // Get the current max order value
    const maxOrder = await this.categoryRepository
      .createQueryBuilder('category')
      .select('MAX(category.order)', 'max')
      .getRawOne();

    // Assign the next order value (default to 1 if no categories exist)
    const nextOrder = (maxOrder?.max || 0) + 1;

    // Create the new category with the calculated order
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      order: nextOrder, // Use auto-increment
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(userRole: Role): Promise<ArticleCategory[]> {
    return await this.categoryRepository
      .find({
        order: { order: 'ASC' },
        relations: ['articles'],
        loadEagerRelations: false, // Ensures filtering applies before loading relations
      })
      .then((categories) => {
        return categories.map((category) => ({
          ...category,
          articles: category.articles
            .filter(
              (article) =>
                userRole === Role.SUPER_ADMIN ||
                article.availableFor.includes(userRole),
            )
            .sort((a, b) => a.order - b.order),
        }));
      });
  }

  async findOne(id: string): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateArticleCategoryDto,
  ): Promise<ArticleCategory> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async reorder(
    categories: { id: string; order: number }[],
  ): Promise<{ message: string }> {
    await Promise.all(
      categories.map((category) =>
        this.categoryRepository.update(category.id, { order: category.order }),
      ),
    );
    return { message: 'Categories reordered successfully' };
  }
}
