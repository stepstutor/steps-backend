import { UUID } from 'crypto';
import { Equal, ILike, IsNull, Or } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import {
  CreateProblemDto,
  CowriteProblemResponse,
} from '../dto/create-problem.dto';
import { ProblemsService } from './problems.service';
import { Problem } from '../entities/problem.entity';
import { DraftProblemDto } from '../dto/draft-problem.dto';
import { UpdateProblemDto } from '../dto/update-problem.dto';
import { PublishProblemDto } from '../dto/publish-problem.dto';
import { GetProblemsQueryDto } from '../dto/get-problems-query.dto';
import { GetProblemsByCourseQueryDto } from '../dto/get-problems-by-course-query.dto';

import { Role } from '@common/enums/userRole';
import { UploadType } from '@common/enums/upload-type';
import { PublicationType } from '@common/enums/publication-type';
import { TagsService } from '@modules/tags/services/tags.service';
import { UsersService } from '@modules/user/services/users.service';
import { createPaginatedResponse } from '@common/utils/pagination.util';
import { CoursesService } from '@modules/courses/services/courses.service';
import { AIService } from '@modules/ai/services/ai.service';
import { CowriteProblemDto } from '../dto/cowrite-problem.dto';
import { CowriteSolutionDto } from '../dto/cowrite-solution.dto';

@Injectable()
export class ProblemsManagerService {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    private readonly aiService: AIService,
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
        [],
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder,
        tagIds,
        authenticatedUserId,
        role,
      );
      const mappedProblems = await Promise.all(
        problems.map(async (problem) => {
          const tags = await this.tagsService.extractTagsFromProblem(problem);
          return {
            ...problem,
            solutionKeyUploads: [],
            wrapUpUploads: [],
            problemTextUploads: [],
            tags: [...tags],
          };
        }),
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
          const tags = await this.tagsService.extractTagsFromProblem(problem);
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
      includeSolutionKey,
      includeWrapUp,
      problemTextUploads,
      solutionKeyUploads,
      wrapUpUploads,
      ...problemData
    } = createProblemDto;
    const problem = await this.problemsService.create(
      {
        ...problemData,
        instructorId: authenticatedUserId,
        cowriteProblemAttempts: 0,
        cowriteSolutionAttempts: 0,
        isDraft: false,
      },
      authenticatedUserId,
    );
    // Handle problemTags
    if (problemTags && problemTags.length > 0) {
      const tags = await this.tagsService.findOrCreateTagsByNames(problemTags);
      await this.problemsService.assignTagsToProblem(problem.id, tags);
    }
    // Handle uploads (problem text, solution key, wrap-up)
    await this.problemsService.addProblemUploadsToProblem(
      problem.id,
      problemTextUploads || [],
      solutionKeyUploads || [],
      wrapUpUploads || [],
    );
    // Handle publication to libraries
    if (publishToInstitutionLibrary) {
      // Publish to library
      this.problemsService.publishProblemToLibrary(
        problem.id,
        publishToInstitutionLibrary ? institutionId : null,
        authenticatedUserId,
        includeSolutionKey ? includeSolutionKey : false,
        includeWrapUp ? includeWrapUp : false,
      );
    }
    if (publishToPublicLibrary) {
      this.problemsService.publishProblemToLibrary(
        problem.id,
        null,
        authenticatedUserId,
        includeSolutionKey ? includeSolutionKey : false,
        includeWrapUp ? includeWrapUp : false,
      );
    }
    return problem;
  }

  async createDraftProblem(
    createProblemDto: DraftProblemDto,
    authenticatedUserId: UUID,
  ) {
    const {
      publishToPublicLibrary: _,
      publishToInstitutionLibrary: __,
      problemId,
      problemTags,
      problemTextUploads,
      solutionKeyUploads,
      wrapUpUploads,
      ...problemData
    } = createProblemDto;
    const oldDraftProblem = problemId
      ? await this.problemsService.findOne({
          id: problemId,
          instructorId: authenticatedUserId,
          isDraft: true,
        })
      : null;
    let problem: Problem;
    if (oldDraftProblem) {
      // Update existing draft
      problem = await this.problemsService.update(
        oldDraftProblem.id,
        problemData,
      );
    } else {
      problem = await this.problemsService.create(
        {
          ...problemData,
          instructorId: authenticatedUserId,
          isDraft: true,
        },
        authenticatedUserId,
      );
    }
    // Handle problemTags
    if (problemTags && problemTags.length > 0) {
      const tags = await this.tagsService.findOrCreateTagsByNames(problemTags);
      await this.problemsService.assignTagsToProblem(
        problemId ?? problem.id,
        tags,
      );
    }
    // Handle uploads (problem text, solution key, wrap-up)
    await this.problemsService.addProblemUploadsToProblem(
      problem.id,
      problemTextUploads || [],
      solutionKeyUploads || [],
      wrapUpUploads || [],
      true, // Remove existing uploads before adding new ones
    );
    return problem;
  }

  async getProblemById(
    problemId: string,
    authenticatedUserId: string,
    role: Omit<Role, 'STUDENT'>,
    institutionId: string,
  ) {
    if (role === Role.INSTRUCTOR) {
      const problem = await this.problemsService.findOne(
        {
          id: problemId,
          instructorId: Or(Equal(authenticatedUserId), IsNull()),
        },
        ['problemUploads'],
      );
      if (problem.instructorId === null) {
        const libraryEntry = await problem.libraryEntry;
        if (
          !libraryEntry ||
          (libraryEntry.institutionId !== null &&
            libraryEntry.institutionId !== institutionId)
        ) {
          throw new BadRequestException('Problem not found or access denied');
        }
      }
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      const tags = await this.tagsService.extractTagsFromProblem(problem);
      const solutionKeyUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.SOLUTION_KEY,
      );
      const wrapUpUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.WRAP_UP,
      );
      const problemTextUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.PROBLEM_TEXT,
      );
      return {
        ...problem,
        tags: [...tags],
        problemUploads: undefined,
        solutionKeyUploads,
        wrapUpUploads,
        problemTextUploads,
      };
    } else {
      const problem = await this.problemsService.findOne(
        {
          id: problemId,
          instructorId: IsNull(),
        },
        ['problemUploads'],
      );
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      if (!(await problem.libraryEntry)) {
        throw new BadRequestException(
          'Only library problems can be accessed by admins',
        );
      }
      const solutionKeyUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.SOLUTION_KEY,
      );
      const wrapUpUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.WRAP_UP,
      );
      const problemTextUploads = problem.problemUploads.filter(
        (upload) => upload.uploadType === UploadType.PROBLEM_TEXT,
      );
      const tags = await this.tagsService.extractTagsFromProblem(problem);
      return {
        ...problem,
        tags: [...tags],
        problemUploads: undefined,
        solutionKeyUploads,
        wrapUpUploads,
        problemTextUploads,
      };
    }
  }

  async updateProblem(
    problemId: string,
    updateProblemDto: UpdateProblemDto,
    authenticatedUserId: string,
    role: Omit<Role, 'STUDENT'>,
  ) {
    const {
      problemTags,
      problemTextUploads,
      solutionKeyUploads,
      wrapUpUploads,
      ...problemData
    } = updateProblemDto;
    let updatedProblem: Problem;
    if (role === Role.INSTRUCTOR) {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: authenticatedUserId,
      });
      if (!problem) {
        throw new BadRequestException('Problem not found or access denied');
      }
      updatedProblem = await this.problemsService.update(problemId, {
        ...problemData,
        isDraft: false,
      });
      // Handle uploads (problem text, solution key, wrap-up)
      await this.problemsService.addProblemUploadsToProblem(
        updatedProblem.id,
        problemTextUploads || [],
        solutionKeyUploads || [],
        wrapUpUploads || [],
        true, // Remove existing uploads before adding new ones
      );
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
      updatedProblem = await this.problemsService.update(problemId, {
        ...problemData,
        isDraft: false,
      });
      // Handle uploads (problem text, solution key, wrap-up)
      await this.problemsService.addProblemUploadsToProblem(
        updatedProblem.id,
        problemTextUploads || [],
        solutionKeyUploads || [],
        wrapUpUploads || [],
        true, // Remove existing uploads before adding new ones
      );
    }
    // Handle problemTags
    if (problemTags && problemTags.length > 0) {
      const tags = await this.tagsService.findOrCreateTagsByNames(problemTags);
      await this.problemsService.assignTagsToProblem(updatedProblem.id, tags);
    }
    return updatedProblem;
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
    const { publicationType, includeSolutionKey, includeWrapUp } =
      publishProblemDto;

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
        includeSolutionKey,
        includeWrapUp,
      );
    }

    if (publicationType === PublicationType.PUBLIC) {
      return this.problemsService.publishProblemToLibrary(
        problemId,
        null,
        publisherId,
        includeSolutionKey,
        includeWrapUp,
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
    const { page, limit, sortBy, sortOrder, getPastDueProblems } = queryParams;
    const course = await this.coursesService.findOne({
      id: courseId,
      institutionId,
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    let problems: Problem[], total: number;
    if (getPastDueProblems) {
      [problems, total] = await this.problemsService.getPastDueProblemsByCourse(
        courseId,
        new Date(),
        ['courseProblemSettings'],
        page,
        limit,
        sortBy,
        sortOrder,
      );
    } else {
      [problems, total] = await this.problemsService.findAll(
        {
          courseId,
        },
        ['courseProblemSettings'],
        page,
        limit,
        sortBy,
        sortOrder,
      );
    }
    const mappedProblems = await Promise.all(
      problems.map(async (problem) => {
        const tags = await this.tagsService.extractTagsFromProblem(problem);
        return {
          ...problem,
          solutionKeyUploads: [],
          wrapUpUploads: [],
          problemTextUploads: [],
          settings: await problem.courseProblemSettings,
          tags: [...tags],
        };
      }),
    );
    return createPaginatedResponse(mappedProblems, page, total, limit);
  }

  async cowriteProblem(
    cowriteProblemDto: CowriteProblemDto,
    authenticatedUserId: UUID,
  ): Promise<CowriteProblemResponse> {
    const _user = await this.usersService.findOne(authenticatedUserId, false, [
      'institution',
    ]);
    // * We can add more validations later, e.g., checking if the institution has AI features enabled, etc.
    const { title, description, discipline, statement, problemId } =
      cowriteProblemDto;
    if (problemId) {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: authenticatedUserId,
      });
      if (problemId && !problem) {
        throw new BadRequestException('Problem not found.');
      }
      if (problem.cowriteProblemAttempts >= 1) {
        throw new BadRequestException(
          'You have reached the maximum number of co-write attempts for this problem.',
        );
      }
    }
    const response = await this.aiService.cowriteProblem(
      title,
      description,
      discipline,
      statement,
    );
    if (problemId) {
      await this.problemsService.incrementCowriteProblemAttempts(problemId);
    }
    return response;
  }

  async cowriteSolutionKey(
    cowriteSolutionDto: CowriteSolutionDto,
    authenticatedUserId: UUID,
  ): Promise<{ solutionKey: string }> {
    const _user = await this.usersService.findOne(authenticatedUserId, false, [
      'institution',
    ]);
    // * We can add more validations later, e.g., checking if the institution has AI features enabled, etc.
    const {
      title,
      description,
      discipline,
      statement,
      assumptions,
      commonMistakes,
      additionalInformation,
      instructorPlan,
      problemId,
    } = cowriteSolutionDto;
    if (problemId) {
      const problem = await this.problemsService.findOne({
        id: problemId,
        instructorId: authenticatedUserId,
      });
      if (!problem) {
        throw new BadRequestException('Problem not found.');
      }
      if (problem.cowriteSolutionAttempts >= 1) {
        throw new BadRequestException(
          'You have reached the maximum number of co-write solution attempts for this problem.',
        );
      }
    }
    const response = await this.aiService.generateSolutionKey(
      title,
      description,
      discipline,
      statement,
      assumptions,
      commonMistakes,
      additionalInformation,
      instructorPlan,
    );
    if (problemId) {
      await this.problemsService.incrementCowriteSolutionAttempts(problemId);
    }
    return { solutionKey: response };
  }
}
