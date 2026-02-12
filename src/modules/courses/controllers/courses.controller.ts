// **** Library Imports ****
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Delete,
  Request,
  Response,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { UpdateCourseDto } from '../dto/updateCourseDto';
import { GetCoursesQueryDto } from '../dto/getCoursesQuery.dto';
import { CreateCourseDto, StudentDto } from '../dto/createCourse.dto';
import { CoursesManagerService } from '../services/courses.manager.service';
import { AddProblemToCourseDto } from '../dto/add-problem-to-course.dto';
import { UpdateCourseProblemSettingsDto } from '../dto/update-problem-settings.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courseManagerService: CoursesManagerService) {}

  @Get()
  @ApiOperation({ summary: 'Get courses' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getAll(@Request() req, @Query() query: GetCoursesQueryDto) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    return this.courseManagerService.getCourses(
      authenticatedUserId,
      role,
      institutionId,
      query,
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

  @Put(':id')
  @ApiOperation({ summary: 'Update course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCourseBody: UpdateCourseDto,
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;
    return this.courseManagerService.update(
      id,
      updateCourseBody,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Post(':courseId/instructors')
  @ApiOperation({ summary: 'Add instructors to a course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async addInstructors(
    @Param('courseId') courseId: string,
    @Request() req,
    @Response() res,
    @Body() addInstructorsBody: string[],
  ) {
    const {
      id: authenticatedUserId,
      role,
      institutionId,
      firstName,
      lastName,
    } = req.user;

    this.courseManagerService.addInstructorsToCourse(
      courseId,
      addInstructorsBody,
      authenticatedUserId,
      role,
      institutionId,
      firstName,
      lastName,
    );
  }

  @Delete(':courseId/instructors')
  @ApiOperation({ summary: 'Remove instructors from a course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async removeInstructor(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() removeInstructorBody: string | string[],
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;
    return this.courseManagerService.removeInstructorsFromCourse(
      courseId,
      removeInstructorBody,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Post(':courseId/students')
  @ApiOperation({ summary: 'Add students to a course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: [StudentDto] })
  async addStudents(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() addStudentsBody: StudentDto[],
  ) {
    const {
      id: authenticatedUserId,
      role,
      institutionId,
      firstName,
      lastName,
    } = req.user;

    this.courseManagerService.addStudentsToCourse(
      courseId,
      addStudentsBody,
      authenticatedUserId,
      role,
      institutionId,
      firstName,
      lastName,
    );
  }

  @Post(':courseId/problem/:problemId')
  @ApiOperation({ summary: 'Add problem to a course' })
  @ApiParam({ name: 'problemId', description: 'ID of the problem to add' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @Roles([Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async addProblem(
    @Param('courseId') courseId: string,
    @Param('problemId') problemId: string,
    @Request() req,
    @Body() addProblemBody: AddProblemToCourseDto,
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    return await this.courseManagerService.addProblemToCourse(
      courseId,
      problemId,
      addProblemBody,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Put(':courseId/problem/:problemId')
  @ApiOperation({ summary: 'Update course problem settings' })
  @ApiParam({ name: 'problemId', description: 'ID of the problem to update' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @Roles([Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async updateProblemSettings(
    @Param('courseId') courseId: string,
    @Param('problemId') problemId: string,
    @Request() req,
    @Body() updateProblemBody: UpdateCourseProblemSettingsDto,
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    return this.courseManagerService.updateProblemSettings(
      courseId,
      problemId,
      updateProblemBody,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Delete(':courseId/problem/:problemId')
  @ApiOperation({ summary: 'Remove problem from a course' })
  @ApiParam({ name: 'problemId', description: 'ID of the problem to remove' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @Roles([Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async removeProblem(
    @Param('courseId') courseId: string,
    @Param('problemId') problemId: string,
    @Request() req,
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;
    this.courseManagerService.removeProblemFromCourse(
      courseId,
      problemId,
      authenticatedUserId,
      role,
      institutionId,
    );
  }

  @Delete(':courseId/students')
  @ApiOperation({ summary: 'Remove students from a course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async removeStudents(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() removeStudentsBody: string[],
  ) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    this.courseManagerService.removeStudentsFromCourse(
      courseId,
      removeStudentsBody,
      authenticatedUserId,
      role,
      institutionId,
    );
  }
}
