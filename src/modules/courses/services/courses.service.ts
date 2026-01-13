import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import { Role } from '@common/enums/userRole';
import { User } from '@modules/user/entities/user.entity';
import { InstructorType } from '@common/enums/instructorType';
import { UsersService } from '@modules/user/services/users.service';
import { ReceiverGroup } from '@common/enums/notificationReceiverGroup';
import { ProblemsService } from '@modules/problems/services/problems.service';
import { InstitutionsService } from '@modules/institutions/institutions.service';
import { Institution } from '@modules/institutions/entities/institutions.entity';
import { UserWithInvitationLink } from '@modules/user/types/userWithInvitationLink';

import { Course } from '../entities/course.entity';
import { StudentDto } from '../dto/createCourse.dto';
import { CourseStudent } from '../entities/course-student.entity';
import { CourseInstructor } from '../entities/course-instructor.entity';
import { CourseProblemSettings } from '../entities/course-problem-settings.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseStudent)
    private courseStudentRepository: Repository<CourseStudent>,
    @InjectRepository(CourseInstructor)
    private courseInstructorRepository: Repository<CourseInstructor>,
    @InjectRepository(CourseProblemSettings)
    private courseProblemSettingsRepository: Repository<CourseProblemSettings>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => InstitutionsService))
    private readonly institutionService: InstitutionsService,
    @Inject(forwardRef(() => ProblemsService))
    private readonly problemsService: ProblemsService,
  ) {}

  async findAll(
    where?: FindOptionsWhere<Course>,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    userId?: string,
    role?: Role,
  ): Promise<[Course[], number]> {
    const query = this.courseRepository.createQueryBuilder('course');
    if (where) {
      query.where(where);
    }
    if (role === Role.INSTRUCTOR && userId) {
      query.leftJoin(
        'course.courseInstructors',
        'courseInstructor',
        'courseInstructor.instructorId = :userId',
        { userId },
      );
    }
    if (role === Role.STUDENT && userId) {
      query.leftJoin(
        'course.courseStudents',
        'courseStudent',
        'courseStudent.studentId = :userId',
        { userId },
      );
    }
    if (sortBy) {
      query.orderBy(`course.${sortBy}`, sortOrder || 'ASC');
    } else {
      query.orderBy('course.createdAt', 'DESC');
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    return query.getManyAndCount();
  }

  async findOne(where: FindOptionsWhere<Course>): Promise<Course | null> {
    return this.courseRepository.findOne({
      where,
    });
  }

  async create(
    course: Partial<Course>,
    students: StudentDto[] = [],
    mainInstructor: string,
    subInstructors: string[] = [],
  ): Promise<{
    courseEntity: Course;
    studentUsers: User[];
    subInstructorUsers: User[];
    institution: Institution | null;
    mainInstructor: User;
  }> {
    return await this.dataSource.transaction(async (entityManager) => {
      const obj = entityManager.create(Course, course);
      const courseEntity = await entityManager.save(obj);
      const mainInstructorUser =
        await this.usersService.findByEmail(mainInstructor);
      if (!mainInstructorUser) {
        throw new InternalServerErrorException(
          'Unable to create course. Please contact your admin.',
        );
      }

      const institution = await this.institutionService.findOne({
        id: courseEntity.institutionId!,
      });

      const subInstructorUsers = await this.usersService.findAll({
        email: In(subInstructors),
        role: Role.INSTRUCTOR,
      });

      const studentUsers = await this.usersService.findAll({
        email: In(students),
        role: Role.STUDENT,
      });

      const courseInstructorEntities = subInstructorUsers.map((user) => {
        const courseInstructor = new CourseInstructor();
        courseInstructor.courseId = courseEntity.id;
        courseInstructor.instructorId = user.id;
        courseInstructor.createdBy = courseEntity.createdBy;
        courseInstructor.updatedBy = courseEntity.updatedBy;
        courseInstructor.instructorType = InstructorType.SUB;
        return courseInstructor;
      });

      const courseInstructor = new CourseInstructor();
      courseInstructor.courseId = courseEntity.id;
      courseInstructor.instructorId = mainInstructorUser.id;
      courseInstructor.createdBy = courseEntity.createdBy;
      courseInstructor.updatedBy = courseEntity.updatedBy;
      courseInstructor.instructorType = InstructorType.MAIN;
      courseInstructorEntities.push(courseInstructor);

      await entityManager.save(courseInstructorEntities);

      const courseStudentEntities = studentUsers.map((user) => {
        const courseStudent = new CourseStudent();
        courseStudent.courseId = courseEntity.id;
        courseStudent.studentId = user.id;
        courseStudent.createdBy = courseEntity.createdBy;
        courseStudent.updatedBy = courseEntity.updatedBy;
        return courseStudent;
      });

      await entityManager.save(courseStudentEntities);
      return {
        courseEntity,
        studentUsers,
        subInstructorUsers,
        institution,
        mainInstructor: mainInstructorUser,
      };
    });
  }

  async modify(
    course: Partial<Course>,
    mainInstructor: string | null,
    where: FindOptionsWhere<Course>,
  ): Promise<{ course: Course; updatedFields: string }> {
    return await this.dataSource.transaction(async (entityManager) => {
      const existingCourse = await entityManager.findOne(Course, { where });
      if (!existingCourse) {
        throw new BadRequestException();
      }

      const updatedFields: string[] = [];
      if (course.name && course.name !== existingCourse.name) {
        updatedFields.push('name');
      }
      if (
        course.timePeriod &&
        course.timePeriod !== existingCourse.timePeriod
      ) {
        updatedFields.push('time period');
      }
      if (
        course.description &&
        course.description !== existingCourse.description
      ) {
        updatedFields.push('description');
      }
      const entity = entityManager.merge(Course, existingCourse, course);

      if (mainInstructor) {
        const mainInstructorUser =
          await this.usersService.findByEmail(mainInstructor);
        if (!mainInstructorUser) {
          throw new InternalServerErrorException(
            'Unable to update course. Please contact your admin.',
          );
        }
        const mainInstructorEntity = (await entity.courseInstructors)?.find(
          (item) => item.instructorType === InstructorType.MAIN,
        );
        if (mainInstructorEntity) {
          mainInstructorEntity.instructorId = mainInstructorUser.id;
          await entityManager.save(mainInstructorEntity);
        }
      }
      await entityManager.save(entity);
      const formattedUpdatedFields =
        updatedFields.length > 1
          ? `${updatedFields.slice(0, -1).join(', ')} and ${updatedFields.slice(-1)}`
          : updatedFields.join(', ');

      return { course: existingCourse, updatedFields: formattedUpdatedFields };
    });
  }

  async addStudents(
    course: Course,
    students: StudentDto[],
    by: UUID,
    inviteNewStudents: boolean = false,
  ) {
    return await this.dataSource.transaction(async (entityManager) => {
      const existingCourseStudents = await course.courseStudents;
      const newUsers: UserWithInvitationLink[] = [];
      const newCourseUsersAdded: User[] = [];
      for await (const student of students) {
        let user = await entityManager.findOne(User, {
          where: {
            email: student.email,
            role: Role.STUDENT,
          },
        });

        if (!user && inviteNewStudents) {
          const addedUser = await this.usersService.addBulk([
            {
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              role: Role.STUDENT,
              isActive: false,
              institutionId: course.institutionId,
              createdBy: by,
              updatedBy: by,
            },
          ]);

          user = addedUser[0];
          newUsers.push(addedUser[0]);
        }

        if (!user) {
          continue;
        }

        if (
          existingCourseStudents.find((item) => item.studentId === user?.id)
        ) {
          continue;
        }

        const courseStudent = new CourseStudent();
        courseStudent.courseId = course.id;
        courseStudent.studentId = user.id;
        courseStudent.createdBy = by;
        courseStudent.updatedBy = by;
        await entityManager.save(courseStudent);
        newCourseUsersAdded.push(user);
      }
      return { newUsers, newCourseUsersAdded };
    });
  }

  async addInstructors(course: Course, instructors: string[], by: any) {
    return await this.dataSource.transaction(async (entityManager) => {
      const existingCourseInstructors = await course.courseInstructors;
      const newCourseInstructorsAdded: string[] = [];
      for await (const instructor of instructors) {
        const user = await entityManager.findOne(User, {
          where: {
            email: instructor,
            role: Role.INSTRUCTOR,
          },
        });
        if (!user) {
          continue;
        }
        if (
          existingCourseInstructors.find(
            (item) => item.instructorId === user?.id,
          )
        ) {
          continue;
        }
        const courseInstructor = new CourseInstructor();
        courseInstructor.courseId = course.id;
        courseInstructor.instructorId = user.id;
        courseInstructor.instructorType = InstructorType.SUB;
        courseInstructor.createdBy = by;
        courseInstructor.updatedBy = by;
        await entityManager.save(courseInstructor);
        newCourseInstructorsAdded.push(instructor);
      }
      return this.usersService.findAll({
        email: In(newCourseInstructorsAdded),
      });
    });
  }

  async removeInstructors(course: Course, instructors: string[]) {
    return await this.dataSource.transaction(async (entityManager) => {
      const existingCourseInstructors = await course.courseInstructors;

      for (const instructor of instructors) {
        const user = await entityManager.findOne(User, {
          where: {
            email: instructor,
          },
        });
        if (!user) {
          continue;
        }
        const existingCourseInstructor = existingCourseInstructors.find(
          (item) => item.instructorId === user?.id,
        );
        if (existingCourseInstructor) {
          await entityManager.remove(existingCourseInstructor);
        }
      }
    });
  }

  async removeStudents(course: Course, students: string[]) {
    return await this.dataSource.transaction(async (entityManager) => {
      const existingCourseStudents = await course.courseStudents;

      for await (const student of students) {
        const user = await entityManager.findOne(User, {
          where: {
            email: student,
          },
        });
        if (!user) {
          continue;
        }
        const existingCourseStudent = existingCourseStudents.find(
          (item) => item.studentId === user?.id,
        );
        if (existingCourseStudent) {
          await entityManager.remove(existingCourseStudent);
        }
      }
    });
  }

  async archiveCourseOfDeletedUser(instructorId: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const courses = await entityManager.find(Course, {
        where: {
          courseInstructors: {
            instructorId,
            instructorType: InstructorType.MAIN,
          },
        },
        relations: ['courseInstructors'],
      });
      // Always delete the instructor from the course instructor table when the instructor type is SUB
      entityManager.delete(CourseInstructor, {
        instructorId,
        instructorType: InstructorType.SUB,
      });
      if (!courses || courses.length === 0) {
        return [];
      }
      const courseIds = courses.map((course) => course.id);
      await entityManager.update(Course, courseIds, {
        isActive: false,
      });
      return courses;
    });
  }

  async removeStudentFromCourses(studentId: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const courseStudentsRepo = entityManager.getRepository(CourseStudent);
      await courseStudentsRepo.delete({ studentId });
    });
  }

  async getCourseUserIds(
    courseId: string[],
    users: ReceiverGroup,
  ): Promise<string[]> {
    const userIds: Set<string> = new Set();
    if (users === ReceiverGroup.STUDENT || users === ReceiverGroup.BOTH) {
      const studentIds = await this.courseStudentRepository.find({
        where: {
          courseId: In(courseId),
        },
        select: ['studentId'],
      });
      studentIds.forEach((x) => userIds.add(x.studentId));
    }
    if (users === ReceiverGroup.INSTRUCTOR || users === ReceiverGroup.BOTH) {
      const instructorIds = await this.courseInstructorRepository.find({
        where: {
          courseId: In(courseId),
        },
        select: ['instructorId'],
      });
      instructorIds.forEach((x) => userIds.add(x.instructorId));
    }
    return Array.from(userIds);
  }

  async getCourseMainInstructors(courseInstructors: CourseInstructor[]) {
    const mainCourseInstructors = courseInstructors.filter(
      (item) => item.instructorType === InstructorType.MAIN,
    );
    let mainInstructor: User | null = null;

    if (mainCourseInstructors.length > 0) {
      mainInstructor = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .withDeleted() // Include soft-deleted users
        .where('user.id = :id', { id: mainCourseInstructors[0].instructorId })
        .getOne();
      if (!mainInstructor) {
        throw new BadRequestException('Main instructor not found');
      }
    }
    return mainInstructor;
  }

  async getCourseDetail(course: Course) {
    const courseDetails = { ...course };
    const courseInstructors = await course.courseInstructors;
    const mainCourseInstructors = courseInstructors.filter(
      (item) => item.instructorType === InstructorType.MAIN,
    );
    let mainInstructor: User | null = null;

    if (mainCourseInstructors.length > 0) {
      mainInstructor = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .withDeleted() // Include soft-deleted users
        .where('user.id = :id', { id: mainCourseInstructors[0].instructorId })
        .getOne();
      if (!mainInstructor) {
        throw new BadRequestException('Main instructor not found');
      }
    }
    const subInstructors = courseInstructors
      .filter((item) => item.instructorType === InstructorType.SUB)
      .map((item) => item.instructor);

    const courseStudents = await course.courseStudents;
    const students = courseStudents.map((item) => item.student);

    // TODO: Implement getting assignments and attached problems here once the entities are ready.
    return {
      course: courseDetails,
      mainInstructor,
      subInstructors: await Promise.all(subInstructors),
      students: await Promise.all(students),
    };
  }

  async addProblemToCourse(
    course: Course,
    problemId: string,
    addProblemBody: DeepPartial<CourseProblemSettings>,
    authenticatedUserId: UUID,
  ) {
    const problem = await this.problemsService.findOne({ id: problemId });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    const tags = await problem.tags;
    const { id: _, ...problemData } = problem;
    const problemCopy = await this.problemsService.create(
      {
        ...problemData,
        courseId: course.id,
        problemTags: tags.map((tag) => tag.name),
        createdBy: authenticatedUserId,
        updatedBy: authenticatedUserId,
      },
      authenticatedUserId,
    );
    const courseProblemSettings = new CourseProblemSettings();
    courseProblemSettings.courseId = course.id;
    courseProblemSettings.problemId = problemCopy.id;
    Object.assign(courseProblemSettings, addProblemBody);
    await this.courseProblemSettingsRepository.save(courseProblemSettings);
    return this.problemsService.findOne({ id: problemCopy.id }, [
      'tags',
      'courseProblemSettings',
    ]);
  }

  async updateProblemSettings(
    course: Course,
    problemId: string,
    updateProblemBody: DeepPartial<CourseProblemSettings>,
    authenticatedUserId: UUID,
  ) {
    const problem = await this.problemsService.findOne({ id: problemId }, [
      'courseProblemSettings',
    ]);

    if (problem.courseId !== course.id) {
      throw new BadRequestException('Problem does not belong to this course');
    }

    const existingSettings = await this.courseProblemSettingsRepository.findOne(
      {
        where: { courseId: course.id, problemId },
      },
    );

    if (!existingSettings) {
      throw new NotFoundException('Course problem settings not found');
    }

    Object.entries(updateProblemBody).forEach(([key, value]) => {
      if (value !== undefined) {
        existingSettings[key] = value;
      }
    });

    existingSettings.updatedBy = authenticatedUserId;

    await this.courseProblemSettingsRepository.save(existingSettings);

    return this.problemsService.findOne({ id: problemId }, [
      'tags',
      'courseProblemSettings',
    ]);
  }
}
