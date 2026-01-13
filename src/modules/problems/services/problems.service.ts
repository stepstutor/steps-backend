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
  ) {}

  async create(
    createProblemData: CreateProblemData & { problemTags?: string[] },
    authenticatedUserId: UUID,
  ): Promise<Problem> {
    const instructor = this.usersService.findOne(
      createProblemData.instructorId,
    );

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const { problemTags, ...problemData } = createProblemData;

    const problem = this.problemRepository.create({
      ...problemData,
      createdBy: authenticatedUserId,
      updatedBy: authenticatedUserId,
    });
    // Handle problemTags if needed
    if (problemTags && problemTags.length > 0) {
      problemTags.map((tagId) => {
        const problemTag = this.problemTagRepository.create({
          tagId,
        });
        return problemTag;
      });
    }
    return await this.problemRepository.save(problem);
  }

  async findAll(
    where?: FindOptionsWhere<Problem>,
    relations?: string[],
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    tagIds?: string[],
  ): Promise<[Problem[], number]> {
    const query = this.problemRepository.createQueryBuilder('problem');

    if (where) {
      query.where(where);
    }
    if (tagIds && tagIds.length > 0) {
      query
        .innerJoin('problem.tags', 'tag')
        .andWhere('tag.id IN (:...tagIds)', { tagIds });
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
    updateProblemDto: Partial<CreateProblemData & { problemTags?: string[] }>,
  ): Promise<Problem> {
    const problem = await this.findOne({ id });
    if (
      updateProblemDto.courseId &&
      updateProblemDto.courseId !== problem.courseId
    ) {
      const course = await this.coursesService.findOne({
        id: updateProblemDto.courseId,
      });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    if (
      updateProblemDto.instructorId &&
      updateProblemDto.instructorId !== problem.instructorId
    ) {
      const instructor = await this.usersService.findOne(
        updateProblemDto.instructorId,
      );
      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }
    }

    Object.assign(problem, updateProblemDto);
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
        .innerJoin('problem.tags', 'tag')
        .andWhere('tag.id IN (:...tagIds)', { tagIds });
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
  ): Promise<ProblemLibrary> {
    const problem = await this.findOne({ id });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    const { id: _, ...problemWithoutId } = problem;
    const problemCopy = this.problemRepository.create({
      ...problemWithoutId,
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
    const oldProblemTags = await problem.tags;
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
    const { id: _, ...problemWithoutId } = libraryProblem;
    const problemCopy = this.problemRepository.create({
      ...problemWithoutId,
      instructorId: instructorId,
      createdBy: instructorId,
      updatedBy: instructorId,
    });
    return await this.problemRepository.save(problemCopy);
  }

  async assignTagsToProblem(problemId: string, tags: Tag[]): Promise<void> {
    for (const tag of tags) {
      const problemTag = this.problemTagRepository.create({
        problemId,
        tagId: tag.id,
      });
      await this.problemTagRepository.save(problemTag);
    }
  }
}
