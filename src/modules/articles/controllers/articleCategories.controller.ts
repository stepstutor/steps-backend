// **** Library Imports ****
import {
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { ReorderCategoriesDto } from '../dto/reorder-articleCategories.dto';
import { CreateArticleCategoryDto } from '../dto/create-categoryArticle.dto';
import { UpdateArticleCategoryDto } from '../dto/update-categoryArticle.dto';
import { ArticleCategoriesService } from '../services/articleCategory.service';

@ApiTags('ArticleCategories')
@Controller('article-categories')
export class ArticleCategoryController {
  constructor(private readonly categoryService: ArticleCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateArticleCategoryDto })
  create(@Body() createCategoryDto: CreateArticleCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @Roles([
    Role.SUPER_ADMIN,
    Role.INSTITUTE_ADMIN,
    Role.INSTRUCTOR,
    Role.STUDENT,
  ])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  findAll(@Request() req) {
    const { role } = req.user;
    return this.categoryService.findAll(role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder categories' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  reorder(@Body() reorderData: ReorderCategoriesDto) {
    return this.categoryService.reorder(reorderData.categories);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateArticleCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
