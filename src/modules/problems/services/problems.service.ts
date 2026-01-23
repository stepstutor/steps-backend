import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';

import { ProblemTag } from '../entities/problem-tag.entity';
import { ProblemLibrary } from '../entities/problem-library.entity';
import { CreateProblemData, Problem } from '../entities/problem.entity';

import { Role } from '@common/enums/userRole';
import { UsersService } from '@modules/user/services/users.service';
import { CoursesService } from '@modules/courses/services/courses.service';
import { Tag } from '@modules/tags/entities/tag.entity';
import { TagsService } from '@modules/tags/services/tags.service';
import { UpdateProblemDto } from '../dto/update-problem.dto';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
    @InjectRepository(ProblemLibrary)
    private readonly problemLibraryRepository: Repository<ProblemLibrary>,
    @InjectRepository(ProblemTag)
    private readonly problemTagRepository: Repository<ProblemTag>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
  ) {}

  async create(
    createProblemData: CreateProblemData & {
      problemTags?: string[];
      instructorId: string;
      isDraft?: false;
    },
    authenticatedUserId: UUID,
  ): Promise<Problem>;

  async create(
    createProblemData: UpdateProblemDto & {
      problemTags?: string[];
      instructorId: string;
      isDraft?: true;
    },
    authenticatedUserId: UUID,
  ): Promise<Problem>;

  async create(
    createProblemData: (CreateProblemData | UpdateProblemDto) & {
      problemTags?: string[];
      instructorId: string;
      isDraft?: boolean;
    },
    authenticatedUserId: UUID,
  ): Promise<Problem> {
    const instructor = this.usersService.findOne(
      createProblemData.instructorId,
    );

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const { problemTags: _, ...problemData } = createProblemData;

    const problem = this.problemRepository.create({
      ...problemData,
      createdBy: authenticatedUserId,
      updatedBy: authenticatedUserId,
    });
    return await this.problemRepository.save(problem);
  }

  async createCourseProblem(
    problem: Problem,
    courseId: string,
    authenticatedUserId: UUID,
    tags: Tag[],
    asDraft?: boolean,
  ): Promise<Problem> {
    const {
      id: _,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      createdBy: _createdBy,
      updatedBy: _updatedBy,
      ...problemWithoutId
    } = problem;
    const duplicatedProblem = this.problemRepository.create({
      ...problemWithoutId,
      courseId,
      createdBy: authenticatedUserId,
      updatedBy: authenticatedUserId,
      isDraft: !!asDraft,
    });
    if (tags && tags.length > 0) {
      duplicatedProblem.problemTags = Promise.resolve(
        tags.map((tag) => {
          const problemTag = this.problemTagRepository.create({
            tagId: tag.id,
          });
          return problemTag;
        }),
      );
    }
    return await this.problemRepository.save(duplicatedProblem);
  }

  async findAll(
    where?: FindOptionsWhere<Problem>,
    relations?: string[],
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    tagIds?: string[],
    authenticatedUserId?: string,
    role?: Omit<Role, Role.STUDENT>,
  ): Promise<[Problem[], number]> {
    const query = this.problemRepository.createQueryBuilder('problem');

    if (where) {
      query.where(where);
    }
    if (tagIds && tagIds.length > 0) {
      query
        .innerJoin('problem.problemTags', 'problemTag')
        .andWhere('problemTag.tagId IN (:...tagIds)', { tagIds });
    }
    if (role === Role.INSTRUCTOR && authenticatedUserId) {
      query
        .leftJoin('problem.libraryEntry', 'libraryEntry')
        .andWhere('problem.instructorId = :instructorId', {
          instructorId: authenticatedUserId,
        })
        .andWhere('libraryEntry.id IS NULL');
    }
    if (sortBy) {
      query.orderBy(`problem.${sortBy}`, sortOrder || 'ASC');
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    if (relations && relations.length > 0) {
      relations.forEach((relation) => {
        query.leftJoinAndSelect(`problem.${relation}`, relation);
      });
    }
    return await query.getManyAndCount();
  }

  async findOne(
    where: FindOptionsWhere<Problem>,
    relations?: string[],
  ): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where, relations });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    return problem;
  }

  async update(
    id: string,
    problemData: Partial<CreateProblemData>,
  ): Promise<Problem> {
    const problem = await this.findOne({ id });
    if (problemData.courseId && problemData.courseId !== problem.courseId) {
      const course = await this.coursesService.findOne({
        id: problemData.courseId,
      });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    if (
      problemData.instructorId &&
      problemData.instructorId !== problem.instructorId
    ) {
      const instructor = await this.usersService.findOne(
        problemData.instructorId,
      );
      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }
    }

    Object.assign(problem, problemData);
    return await this.problemRepository.save(problem);
  }

  async remove(id: string): Promise<{ message: string }> {
    const problem = await this.findOne({ id });
    await this.problemRepository.softRemove(problem);
    return { message: 'Problem removed successfully' };
  }

  async getProblemsByLibraryType(
    institutionId?: string | null,
    where?: FindOptionsWhere<ProblemLibrary>,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    tagIds?: string[],
  ): Promise<[Problem[], number]> {
    const query = this.problemLibraryRepository
      .createQueryBuilder('problemLibrary')
      .leftJoinAndSelect('problemLibrary.problem', 'problem');
    if (institutionId) {
      query.where('problemLibrary.institutionId = :institutionId', {
        institutionId,
      });
    } else {
      query.where('problemLibrary.institutionId IS NULL');
    }
    if (where) {
      query.andWhere(where);
    }
    if (tagIds && tagIds.length > 0) {
      query
        .innerJoin('problem.problemTags', 'problemTag')
        .andWhere('problemTag.tagId IN (:...tagIds)', { tagIds });
    }
    if (sortBy) {
      query.orderBy(`problem.${sortBy}`, sortOrder || 'ASC');
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    const results = await query.getManyAndCount();
    const problems = results[0].map((result) => ({
      ...result.problem,
      instructorId: result.instructorId,
    }));
    return [problems, results[1]];
  }

  async removeProblemFromLibrary(
    id: string,
    role: Omit<Role, Role.STUDENT | Role.INSTRUCTOR>,
  ): Promise<{ message: string }> {
    if (role === Role.INSTITUTE_ADMIN || role === Role.SUPER_ADMIN) {
      const problemLibraryEntry = await this.problemLibraryRepository.findOne({
        where: {
          problemId: id,
          institutionId:
            role === Role.INSTITUTE_ADMIN ? Not(IsNull()) : IsNull(),
        },
      });
      if (!problemLibraryEntry) {
        throw new NotFoundException('Problem library entry not found');
      }
      await this.problemLibraryRepository.softRemove(problemLibraryEntry);
      return { message: 'Problem removed from library successfully' };
    } else {
      throw new NotFoundException('Access denied');
    }
  }

  async publishProblemToLibrary(
    id: string,
    institutionId: string | null,
    instructorId: UUID,
    includeSolutionKey: boolean,
    includeWrapUp: boolean,
  ): Promise<ProblemLibrary> {
    const problem = await this.findOne({ id });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    const {
      id: _,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...problemWithoutId
    } = problem;
    const problemCopy = this.problemRepository.create({
      ...problemWithoutId,
      solutionKey: includeSolutionKey ? problem.solutionKey : null,
      wrapUp: includeWrapUp ? problem.wrapUp : null,
      isDraft: !includeSolutionKey ? true : problem.isDraft,
      instructorId: instructorId,
      createdBy: instructorId,
      updatedBy: instructorId,
    });
    const savedCopy = await this.problemRepository.save(problemCopy);
    const problemLibraryEntry = this.problemLibraryRepository.create({
      problemId: savedCopy.id,
      institutionId: institutionId,
      instructorId: instructorId,
      createdBy: instructorId,
      updatedBy: instructorId,
    });
    const oldProblemTags =
      await this.tagsService.extractTagsFromProblem(problem);
    for (const tag of oldProblemTags) {
      const problemTag = this.problemTagRepository.create({
        problemId: savedCopy.id,
        tagId: tag.id,
      });
      await this.problemTagRepository.save(problemTag);
    }
    return await this.problemLibraryRepository.save(problemLibraryEntry);
  }

  async copyProblemFromLibrary(
    libraryProblemId: string,
    instructorId: UUID,
  ): Promise<Problem> {
    const libraryProblem = await this.findOne({ id: libraryProblemId }, [
      'libraryEntry',
    ]);
    if (!libraryProblem || !(await libraryProblem.libraryEntry)) {
      throw new NotFoundException('Library problem not found');
    }
    const {
      id: _,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      problemTags: _problemTags,
      libraryEntry: _libraryEntry,
      ...problemWithoutId
    } = libraryProblem;
    const problemCopy = this.problemRepository.create({
      ...problemWithoutId,
      instructorId: instructorId,
      createdBy: instructorId,
      updatedBy: instructorId,
    });
    const tags = await this.tagsService.extractTagsFromProblem(libraryProblem);
    const savedProblem = await this.problemRepository.save(problemCopy);
    await this.assignTagsToProblem(savedProblem.id, tags, false);
    return savedProblem;
  }

  async assignTagsToProblem(
    problemId: string,
    tags: Tag[],
    clearOld: boolean = true,
  ): Promise<void> {
    if (clearOld) {
      this.problemTagRepository.delete({
        problemId,
      });
    }
    for (const tag of tags) {
      const problemTag = this.problemTagRepository.create({
        problemId,
        tagId: tag.id,
      });
      await this.problemTagRepository.save(problemTag);
    }
  }

  async getPastDueProblemsByCourse(
    courseId: string,
    date: Date,
    relations?: string[],
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<[Problem[], number]> {
    const query = this.problemRepository.createQueryBuilder('problem');
    query.leftJoinAndSelect(
      'problem.courseProblemSettings',
      'courseProblemSettings',
    );
    query.where('problem.courseId = :courseId', { courseId });
    query.andWhere(
      `(
      courseProblemSettings.reflectionDueDate IS NOT NULL
      AND courseProblemSettings.reflectionDueDate <= :date
      ) OR (
      courseProblemSettings.reflectionDueDate IS NULL
      AND courseProblemSettings.planningDueDate IS NOT NULL
      AND courseProblemSettings.planningDueDate <= :date
      )`,
      { date },
    );
    if (sortBy) {
      query.orderBy(`problem.${sortBy}`, sortOrder || 'ASC');
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    if (relations && relations.length > 0) {
      relations.forEach((relation) => {
        relation !== 'courseProblemSettings' &&
          query.leftJoinAndSelect(`problem.${relation}`, relation);
      });
    }
    return await query.getManyAndCount();
  }
}
