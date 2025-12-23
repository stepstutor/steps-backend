// **** Library Imports ****
import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import * as _ from 'lodash';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticlesService } from '../services/articles.service';
import { ReorderArticlesDto } from '../dto/reorder-articles.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an article' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateArticleDto })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @Roles([
    Role.SUPER_ADMIN,
    Role.INSTITUTE_ADMIN,
    Role.INSTRUCTOR,
    Role.STUDENT,
  ])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search articles by title or content',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter articles by category ID',
  })
  @ApiBearerAuth('access-token')
  async findAll(
    @Request() req,
    @Query('search') search: string,
    @Query('categoryId') articleCategoryId: string,
  ) {
    const { role } = req.user;
    const articles = await this.articlesService.findAll(
      role,
      search,
      articleCategoryId,
    );
    if (role !== Role.SUPER_ADMIN && !search) {
      const groupedArticles = _.groupBy(
        articles,
        (article) => article.articleCategory.title,
      );
      return groupedArticles;
    }
    return articles;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by ID' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch('reorder/:categoryId')
  @ApiOperation({ summary: 'Reorder articles' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  reorder(
    @Param('categoryId') id: string,
    @Body() reorderData: ReorderArticlesDto,
  ) {
    return this.articlesService.reorder(id, reorderData.articles);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
