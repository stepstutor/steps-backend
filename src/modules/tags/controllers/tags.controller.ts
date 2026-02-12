import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
  Controller,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagsService } from '../services/tags.service';

import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

@Controller('tags')
@ApiTags('Tags')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @ApiBody({ type: CreateTagDto })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get tags' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  findAll() {
    return this.tagsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  search(@Query('q') query: string) {
    return this.tagsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by id' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tag' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
