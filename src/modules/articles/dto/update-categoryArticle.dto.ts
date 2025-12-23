import { PartialType } from '@nestjs/swagger';
import { CreateArticleCategoryDto } from './create-categoryArticle.dto';

export class UpdateArticleCategoryDto extends PartialType(
  CreateArticleCategoryDto,
) {}
