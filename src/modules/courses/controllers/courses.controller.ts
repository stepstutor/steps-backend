import {
  Get,
  Body,
  Post,
  Param,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

import { CreateCourseDto } from '../dto/createCourseDto';
import { CoursesManagerService } from '../services/courses.manager.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courseManagerService: CoursesManagerService) {}

  @Get()
  @ApiOperation({ summary: 'Get courses' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getAll(@Request() req) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    return this.courseManagerService.getCourses(
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async get(@Param('id') id: string, @Request() req) {
    const { id: authenticatedUserId, role, institutionId } = req.user;
    return this.courseManagerService.getById(
      id,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Add a course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateCourseDto })
  async create(@Request() req, @Body() createCourseDtoBody: CreateCourseDto) {
    const {
      id: authenticatedUserId,
      role,
      institutionId,
      email: authenticatedUserEmail,
      firstName,
      lastName,
    } = req.user;

    return this.courseManagerService.create(
      createCourseDtoBody,
      authenticatedUserId,
      role,
      institutionId,
      authenticatedUserEmail,
      firstName,
      lastName,
    );
  }
}
