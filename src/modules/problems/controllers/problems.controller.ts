// **** Library Imports **** //
import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

// **** Module Imports **** //
import { CreateProblemDto } from '../dto/create-problem.dto';
import { UpdateProblemDto } from '../dto/update-problem.dto';
import { PublishProblemDto } from '../dto/publish-problem.dto';
import { GetProblemsQueryDto } from '../dto/get-problems-query.dto';
import { ProblemsManagerService } from '../services/problems.manager.service';

// **** External Imports **** //
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';
import { GetProblemsByCourseQueryDto } from '../dto/get-problems-by-course-query.dto';

@Controller('problems')
@ApiTags('Problems')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
export class ProblemsController {
  constructor(private readonly problemsManager: ProblemsManagerService) {}

  @Get()
  @ApiOperation({ summary: 'Get problems' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  @ApiQuery({
    name: 'libraryType',
    description: 'Type of the library: PUBLIC or INSTITUTION',
    required: false,
    enum: ['PUBLIC', 'INSTITUTION'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'discipline', required: false })
  @ApiQuery({ name: 'instructorId', required: false })
  @ApiQuery({ name: 'tagIds', required: false, isArray: true })
  findAll(@Request() req, @Query() query: GetProblemsQueryDto) {
    const { id: authenticatedUserId, role, institutionId } = req.user;

    return this.problemsManager.getProblems(
      authenticatedUserId,
      role,
      institutionId,
      query,
    );
  }

  @Get('/by-course/:courseId')
  @ApiOperation({ summary: 'Get problems for course' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  findAllByCourse(
    @Param('courseId') courseId: string,
    @Request() req,
    @Query() query: GetProblemsByCourseQueryDto,
  ) {
    const { institutionId } = req.user;
    return this.problemsManager.getProblemsByCourse(
      courseId,
      institutionId,
      query,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create problem' })
  @Roles([Role.INSTRUCTOR])
  @ApiBody({ type: CreateProblemDto })
  create(@Body() createProblemDto: CreateProblemDto, @Request() req) {
    const { id: authenticatedUserId, institutionId } = req.user;
    return this.problemsManager.createProblem(
      createProblemDto,
      authenticatedUserId,
      institutionId,
    );
  }

  @Post('/draft')
  @ApiOperation({ summary: 'Create problem' })
  @Roles([Role.INSTRUCTOR])
  @ApiBody({ type: UpdateProblemDto })
  createDraftProblem(
    @Body() createProblemDto: UpdateProblemDto,
    @Request() req,
  ) {
    const { id: authenticatedUserId } = req.user;
    return this.problemsManager.createDraftProblem(
      createProblemDto,
      authenticatedUserId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get problem by id' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN])
  findOne(@Param('id') id: string, @Request() req) {
    const { id: authenticatedUserId, role } = req.user;
    return this.problemsManager.getProblemById(id, authenticatedUserId, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update problem' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  update(
    @Param('id') id: string,
    @Body() updateProblemDto: UpdateProblemDto,
    @Request() req,
  ) {
    const { id: authenticatedUserId, role } = req.user;
    return this.problemsManager.updateProblem(
      id,
      updateProblemDto,
      authenticatedUserId,
      role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete problem' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  remove(@Param('id') id: string, @Request() req) {
    const { id: authenticatedUserId, role } = req.user;
    return this.problemsManager.deleteProblem(id, authenticatedUserId, role);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a problem to a library' })
  @ApiParam({ name: 'id', description: 'ID of the problem to be published' })
  @ApiBody({ description: 'Publication preferences', type: PublishProblemDto })
  @ApiResponse({ status: 200, description: 'Problem published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Problem not found or already published',
  })
  @Roles([Role.INSTRUCTOR])
  publishProblem(
    @Param('id') problemId: string,
    @Body() publishProblemDto: PublishProblemDto,
    @Request() req,
  ) {
    const { id: authenticatedUserId, institutionId } = req.user;
    return this.problemsManager.publishProblem(
      problemId,
      publishProblemDto,
      authenticatedUserId,
      institutionId,
    );
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Copy a problem to my library' })
  @ApiParam({ name: 'id', description: 'ID of the problem to be copied' })
  @Roles([Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  copyProblem(@Param('id') problemId: string, @Request() req) {
    const { id: authenticatedUserId, institutionId } = req.user;
    return this.problemsManager.copyProblem(
      problemId,
      authenticatedUserId,
      institutionId,
    );
  }
}
