import { UUID } from 'crypto';
import { ILike, IsNull } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ProblemsService } from './problems.service';
import { CreateProblemDto } from '../dto/create-problem.dto';
import { UpdateProblemDto } from '../dto/update-problem.dto';
import { PublishProblemDto } from '../dto/publish-problem.dto';
import { GetProblemsQueryDto } from '../dto/get-problems-query.dto';

import { Role } from '@common/enums/userRole';
import { PublicationType } from '@common/enums/publication-type';
import { UsersService } from '@modules/user/services/users.service';
import { createPaginatedResponse } from '@common/utils/pagination.util';
import { TagsService } from '@modules/tags/services/tags.service';
import { GetProblemsByCourseQueryDto } from '../dto/get-problems-by-course-query.dto';
import { CoursesService } from '@modules/courses/services/courses.service';

@Injectable()
export class ProblemsManagerService {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
  ) {}

  async getProblems(
    authenticatedUserId: string,
    role: Omit<Role, Role.STUDENT>,
    institutionId: string,
    query: GetProblemsQueryDto,
  ) {
    const { libraryType, discipline, instructorId, tagIds, title, isDraft } =
      query;
    if (!libraryType && role === Role.INSTRUCTOR) {
      const [problems, total] = await this.problemsService.findAll(
        {
          instructorId: authenticatedUserId,
          courseId: IsNull(),
          ...(title ? { title: ILike(`%${title}%`) } : {}),
          ...(discipline ? { discipline: ILike(`%${discipline}%`) } : {}),
          ...(instructorId ? { instructorId } : {}),
          ...(typeof isDraft === 'boolean' ? { isDraft } : {}),
        },
        ['tags'],
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder,
        tagIds,
      );
      const mappedProblems = await Promise.all(
        problems.map(async (problem) => ({
          ...problem,
          solutionKeyUploads: [],
          wrapUpUploads: [],
          problemTextUploads: [],
          tags: [...(await problem.tags)],
        })),
      );
      return createPaginatedResponse(
        mappedProblems,
        query.page,
        total,
        query.limit,
      );
    } else if (libraryType) {
      // Fetch the problems from the library
      const [problems, total] =
        await this.problemsService.getProblemsByLibraryType(
          libraryType === 'PUBLIC' ? null : institutionId,
          {
            problem: {
              instructorId: authenticatedUserId,
              courseId: IsNull(),
              ...(title ? { title: ILike(`%${title}%`) } : {}),
              ...(discipline ? { discipline: ILike(`%${discipline}%`) } : {}),
              ...(instructorId ? { instructorId } : {}),
              ...(typeof isDraft === 'boolean' ? { isDraft } : {}),
            },
          },
          query.page,
          query.limit,
          query.sortBy,
          query.sortOrder,
          tagIds,
        );
      const mappedProblems = await Promise.all(
        problems.map(async (problem) => {
          const tags = await problem.tags;
          const lastModifiedBy = await this.usersService.findOne(
            problem.instructorId,
            true,
            ['institution'],
          );
          const institution = await lastModifiedBy?.institution;
          return {
            ...problem,
            instructor:
              lastModifiedBy?.firstName + ' ' + lastModifiedBy?.lastName,
            country: institution?.country,
            university: institution?.name,
            solutionKeyUploads: [],
            wrapUpUploads: [],
            problemTextUploads: [],
            tags: tags ? [...tags] : [],
          };
        }),
      );
      return createPaginatedResponse(
        mappedProblems,
        query.page,
        total,
        query.limit,
      );
    }
  }

  async createProblem(
    createProblemDto: CreateProblemDto,
    authenticatedUserId: UUID,
    institutionId: UUID,
  ) {
    const {
      publishToPublicLibrary,
      publishToInstitutionLibrary,
      problemTags,
      ...problemData
    } = createProblemDto;
    const problem = await this.problemsService.create(
      {
        ...problemData,
        instructorId: authenticatedUserId,
        isDraft: false,
      },
      authenticatedUserId,
    );
    // Handle problemTags
    if (problemTags && problemTags.length > 0) {
      const tags = await this.tagsService.findOrCreateTagsByNames(problemTags);
      await this.problemsService.assignTagsToProblem(problem.id, tags);
    }
    if (publishToInstitutionLibrary) {
      // Publish to library
      this.problemsService.publishProblemToLibrary(
        problem.id,
        publishToInstitutionLibrary ? institutionId : null,
        authenticatedUserId,
      );
    }
    if (publishToPublicLibrary) {
      this.problemsService.publishProblemToLibrary(
        problem.id,
        null,
        authenticatedUserId,
      );
    }
    return problem;
  }

  async createDraftProblem(
    createProblemDto: CreateProblemDto,
    authenticatedUserId: UUID,
  ) {
    const {
      publishToPublicLibrary: _,
      publishToInstitutionLibrary: __,
      ...problemData
    } = createProblemDto;
    const problem = await this.problemsService.create(
      {
        ...problemData,
        instructorId: authenticatedUserId,
        isDraft: true,
      },
      authenticatedUserId,
    );
    return problem;
  }

  async getProblemById(
    problemId: string,
    authenticatedUserId: string,
    role: Omit<Role, 'STUDENT'>,
  ) {
    if (role === Role.INSTRUCTOR) {
      const problem = await this.problemsService.findOne(
        {
          id: problemId,
          instructorId: authenticatedUserId,
        },
        ['tags'],
      );
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      return {
        ...problem,
        tags: [...(await problem.tags)],
        solutionKeyUploads: [],
        wrapUpUploads: [],
        problemTextUploads: [],
      };
    } else {
      const problem = await this.problemsService.findOne(
        {
          id: problemId,
          instructorId: IsNull(),
        },
        ['tags'],
      );
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      if (!(await problem.libraryEntry)) {
        throw new BadRequestException(
          'Only library problems can be accessed by admins',
        );
      }
      return {
        ...problem,
        tags: [...(await problem.tags)],
        solutionKeyUploads: [],
        wrapUpUploads: [],
        problemTextUploads: [],
      };
    }
  }

  async updateProblem(
    problemId: string,
    updateProblemDto: UpdateProblemDto,
    authenticatedUserId: string,
    role: Omit<Role, 'STUDENT'>,
  ) {
    if (role === Role.INSTRUCTOR) {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: authenticatedUserId,
      });
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      return this.problemsService.update(problemId, updateProblemDto);
    } else {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: IsNull(),
      });
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      if (!(await problem.libraryEntry)) {
        throw new BadRequestException(
          'Only library problems can be updated by admins',
        );
      }
      return this.problemsService.update(problemId, updateProblemDto);
    }
  }

  async deleteProblem(
    problemId: string,
    authenticatedUserId: string,
    role: Omit<Role, 'STUDENT'>,
  ) {
    if (role === Role.INSTRUCTOR) {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: authenticatedUserId,
      });
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      return this.problemsService.remove(problemId);
    } else {
      await this.problemsService.removeProblemFromLibrary(problemId, role);
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: IsNull(),
      });
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      if (!(await problem.libraryEntry)) {
        throw new BadRequestException(
          'Only library problems can be deleted by admins',
        );
      }
      return this.problemsService.remove(problemId);
    }
  }

  async publishProblem(
    problemId: string,
    publishProblemDto: PublishProblemDto,
    authenticatedUserId: UUID,
    institutionId: UUID | null,
  ) {
    const { publicationType } = publishProblemDto;

    const publisherId = authenticatedUserId;

    if (!publisherId) {
      throw new BadRequestException('Instructor ID is required to publish.');
    }

    if (publicationType === PublicationType.INSTITUTION) {
      const targetInstitutionId = institutionId;
      if (!targetInstitutionId) {
        throw new BadRequestException(
          'Institution ID is required to publish to the institution library.',
        );
      }
      return this.problemsService.publishProblemToLibrary(
        problemId,
        targetInstitutionId,
        publisherId,
      );
    }

    if (publicationType === PublicationType.PUBLIC) {
      return this.problemsService.publishProblemToLibrary(
        problemId,
        null,
        publisherId,
      );
    }
  }

  async copyProblem(
    problemId: string,
    authenticatedUserId: UUID,
    institutionId: UUID | null,
  ) {
    if (!institutionId) {
      throw new BadRequestException(
        'Instructor must belong to an institution to copy problems.',
      );
    }

    return this.problemsService.copyProblemFromLibrary(
      problemId,
      authenticatedUserId,
    );
  }

  async getProblemsByCourse(
    courseId: string,
    institutionId: UUID,
    queryParams: GetProblemsByCourseQueryDto,
  ) {
    const { page, limit, sortBy, sortOrder } = queryParams;
    const course = await this.coursesService.findOne({
      id: courseId,
      institutionId,
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    const [problems, total] = await this.problemsService.findAll(
      {
        courseId,
      },
      ['tags', 'courseProblemSettings'],
      page,
      limit,
      sortBy,
      sortOrder,
    );
    const mappedProblems = await Promise.all(
      problems.map(async (problem) => ({
        ...problem,
        solutionKeyUploads: [],
        wrapUpUploads: [],
        problemTextUploads: [],
        settings: await problem.courseProblemSettings,
        tags: [...(await problem.tags)],
      })),
    );
    return createPaginatedResponse(mappedProblems, page, total, limit);
  }
}
