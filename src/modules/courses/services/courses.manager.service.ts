// **** Library Imports ****
import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { InjectQueue } from '@nestjs/bullmq';
import { BulkJobOptions, Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { FindOptionsWhere, ILike } from 'typeorm';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { User } from '@modules/user/entities/user.entity';
import { NOTIFICATION_QUEUE_NAME } from '@common/constants';
import { InstructorType } from '@common/enums/instructorType';
import { EmailService } from '@common/services/email.service';
import { createPaginatedResponse } from '@common/utils/pagination.util';
import { UserWithInvitationLink } from '@modules/user/types/userWithInvitationLink';
import { NotificationJob } from '@modules/notifications/entities/notification.entity';
import { UserNotification } from '@modules/notifications/entities/userNotification.entity';

// **** Internal Imports ****
import { Course } from '../entities/course.entity';
import { CoursesService } from './courses.service';
import { UpdateCourseDto } from '../dto/updateCourseDto';
import { GetCoursesQueryDto } from '../dto/getCoursesQuery.dto';
import { CreateCourseDto, StudentDto } from '../dto/createCourse.dto';
import { CourseInstructor } from '../entities/course-instructor.entity';
import { AddProblemToCourseDto } from '../dto/add-problem-to-course.dto';

@Injectable()
export class CoursesManagerService {
  private readonly logger = new Logger(CoursesManagerService.name);
  constructor(
    private readonly i18n: I18nService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly coursesService: CoursesService,
    @InjectQueue(NOTIFICATION_QUEUE_NAME)
    private readonly notificationQueue: Queue<
      Partial<UserNotification> | Partial<UserNotification>[] | NotificationJob,
      boolean,
      'scheduled' | 'triggered'
    >,
  ) {}

  async getCourses(
    authenticatedUserId: string,
    role: Role,
    institutionId: string,
    getCoursesQuery: GetCoursesQueryDto,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
    };
    const { page, limit, sortBy, sortOrder } = getCoursesQuery;
    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
      };
    }
    if (role === Role.STUDENT) {
      where = {
        ...where,
      };
    }
    if (getCoursesQuery.isActive !== undefined) {
      where.isActive = getCoursesQuery.isActive;
    }
    if (getCoursesQuery.name !== undefined) {
      where.name = ILike(`%${getCoursesQuery.name}%`);
    }
    const [courses, total] = await this.coursesService.findAll(
      where,
      page,
      limit,
      sortBy,
      sortOrder,
      authenticatedUserId,
      role,
    );
    // const coursesInstructors = await Promise.all(courses.map(course => course.courseInstructors));
    // const coursesStudents = await Promise.all(courses.map(course => course.courseStudents));
    const [coursesInstructors, coursesStudents] = await Promise.all([
      Promise.all(courses.map((course) => course.courseInstructors)),
      Promise.all(courses.map((course) => course.courseStudents)),
    ]);
    const coursesMainInstructors = await Promise.all(
      courses.map((course, i) =>
        this.coursesService.getCourseMainInstructors(coursesInstructors[i]),
      ),
    );

    return createPaginatedResponse(
      courses.map((course, i) => {
        return {
          course,
          instructorsCount: coursesInstructors[i].length,
          studentsCount: coursesStudents[i].length,
          mainInstructor: coursesMainInstructors[i],
        };
      }),
      page,
      total,
      limit,
    );
    // const coursesWithDetails = await Promise.all(
    //   [...courses, ...courses, ...courses, ...courses, ...courses, ...courses, ...courses, ...courses, ...courses, ...courses].map((course) => this.coursesService.getCourseDetail(course)),
    // );
    // return coursesWithDetails.map((course) => {
    //   const { students, subInstructors, activities, osces, ...rest } = course;
    //   return {
    //     ...rest,
    //     studentsCount: students.length,
    //     instructorsCount: subInstructors.length + 1,
    //   };
    // });
  }

  async getById(
    courseId: string,
    authenticatedUserId: string,
    role: Role,
    institutionId: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
        },
      };
    }

    if (role === Role.STUDENT) {
      where = {
        ...where,
        courseStudents: {
          studentId: authenticatedUserId,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new NotFoundException();
    }
    const courseWithDetail = await this.coursesService.getCourseDetail(course);

    // const activities = await Promise.all(
    //   courseWithDetail.activities.map(async (activity) => {
    //     const activityPerforms = await this.activityPerformService.find({
    //       where: {
    //         courseClinicalActivityId: activity.id,
    //         performedById: authenticatedUserId,
    //       },
    //       order: {
    //         createdAt: 'DESC',
    //       },
    //     });
    //     if (!activityPerforms.length) {
    //       return {
    //         ...activity,
    //         status: null,
    //         performCount: 0,
    //         isModified: false,
    //       };
    //     }
    //     return {
    //       ...activity,
    //       performCount: activityPerforms.length,
    //       status: activityPerforms[0].status,
    //       activityPerformId: activityPerforms[0].id,
    //       isModified: activityPerforms[0].isModified,
    //     };
    //   }),
    // );
    // courseWithDetail.activities = activities;
    // courseWithDetail.osces = courseWithDetail.osces.map((osce) => {
    //   const osceActivities = activities.filter((x) => x.osceId === osce.id);
    //   if (!osceActivities.length) {
    //     return { ...osce, status: null };
    //   }
    //   return {
    //     ...osce,
    //     status: this.coursesService.getOsceStatus(
    //       osceActivities.map((x) => ({
    //         status: x.status,
    //         performCount: x.performCount,
    //       })),
    //     ),
    //     isModified: osceActivities.some((x) => x.isModified ?? false),
    //   };
    // });

    return courseWithDetail;
  }

  async create(
    createCourseDto: CreateCourseDto,
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
    authenticatedUserEmail: string,
    firstName: string,
    lastName: string,
  ) {
    const { students, mainInstructor, subInstructors, ...rest } =
      createCourseDto;

    const result = await this.coursesService.create(
      {
        ...rest,
        yearOfStudent: rest.yearOfStudent || null,
        institutionId: institutionId,
        createdBy: authenticatedUserId,
        updatedBy: authenticatedUserId,
      },
      students,
      role === Role.INSTRUCTOR ? authenticatedUserEmail : mainInstructor,
      subInstructors,
    );

    this.sendCourseInvitationEmailsAndNotifications(
      result,
      role === Role.INSTRUCTOR ? authenticatedUserEmail : mainInstructor,
      firstName,
      lastName,
      role,
    ).catch((error) => {
      this.logger.error(
        'Error sending course invitation emails and notifications:',
        error,
      );
    });
    return result.courseEntity;
  }

  async sendCourseInvitationEmailsAndNotifications(
    result: Awaited<ReturnType<typeof this.coursesService.create>>,
    mainInstructorEmail: string,
    firstName: string,
    lastName: string,
    role: Role,
  ) {
    const now = new Date();
    const lang = result.institution?.language;
    const instructorType_main = this.i18n.translate('common.main_instructor', {
      lang,
    });
    const instructorType_sub = this.i18n.translate('common.sub_instructor', {
      lang,
    });
    const notificationObjs: Partial<UserNotification>[] = [
      {
        sentAt: now,
        title: result.courseEntity.name,
        text: this.i18n.translate(
          'notifications.instructors.added_to_course-text',
          { args: { instructorType: instructorType_main }, lang },
        ),
        userId: result.mainInstructor.id,
        linkText: this.i18n.translate(
          'notifications.instructors.added_to_course-link_text',
          { lang },
        ),
        linkUrl:
          `${this.configService.get('SITE_URL')}/instructor/my-courses/` +
          result.courseEntity.id,
      },
    ];
    if (result.subInstructorUsers.length) {
      for (const subInstructorUser of result.subInstructorUsers) {
        notificationObjs.push({
          sentAt: now,
          title: result.courseEntity.name,
          text: this.i18n.translate(
            'notifications.instructors.added_to_course-text',
            { args: { instructorType: instructorType_sub }, lang },
          ),
          linkText: this.i18n.translate(
            'notifications.instructors.added_to_course-link_text',
            { lang },
          ),
          linkUrl:
            `${this.configService.get('SITE_URL')}/instructor/my-courses/` +
            result.courseEntity.id,
          userId: subInstructorUser.id,
        });
        await this.emailService.sendCourseAssignNotificationEmailToInstructor(
          subInstructorUser.email,
          result.courseEntity.name,
          `${firstName} ${lastName}`,
          `${process.env.SITE_URL}/instructor/my-courses/${result.courseEntity.id}`,
          result.institution?.language,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    if (result.studentUsers.length) {
      for (const studentUser of result.studentUsers) {
        notificationObjs.push({
          sentAt: now,
          title: result.courseEntity.name,
          text: this.i18n.translate(
            'notifications.students.added_to_course-text',
            { lang },
          ),
          linkText: this.i18n.translate(
            'notifications.students.added_to_course-link_text',
            { lang },
          ),
          linkUrl:
            `${this.configService.get('SITE_URL')}/student/my-courses/` +
            result.courseEntity.id,
          userId: studentUser.id,
        });
        await this.emailService.sendCourseAssignNotificationEmailToStudent(
          studentUser.email,
          result.courseEntity.name,
          `${firstName} ${lastName}`,
          `${process.env.SITE_URL}/student/my-courses/${result.courseEntity.id}`,
          result.institution?.language,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    this.notificationQueue.add('triggered', notificationObjs);
    if (role === Role.INSTITUTE_ADMIN) {
      await this.emailService.sendCourseAssignNotificationEmailToInstructor(
        mainInstructorEmail,
        result.courseEntity.name,
        `${firstName} ${lastName}`,
        `${process.env.SITE_URL}/instructor/my-courses/${result.courseEntity.id}`,
        result.institution?.language,
      );
    }
  }

  async update(
    id: string,
    updateCourseBody: UpdateCourseDto,
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
  ) {
    const { mainInstructor, ...rest } = updateCourseBody;

    let resp: ReturnType<typeof this.coursesService.modify>;
    if (role === Role.INSTRUCTOR) {
      resp = this.coursesService.modify(rest, null, {
        id,
        institutionId,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      });
    }

    if (role === Role.INSTITUTE_ADMIN) {
      resp = this.coursesService.modify(rest, mainInstructor || null, {
        id,
        institutionId,
      });
    }
    const responseData = await resp!;
    if (!!responseData.updatedFields) {
      const instructors = await (await resp!).course.courseInstructors;
      const now = new Date();
      const lang = (await (await resp!).course.institution)?.language;
      instructors.forEach(async (instructor) => {
        this.notificationQueue.add('triggered', {
          sentAt: now,
          title: (await resp!).course.name,
          text: this.i18n.translate(
            'notifications.instructors.course_edited-text',
            { args: { changedFields: (await resp).updatedFields }, lang },
          ),
          linkText: this.i18n.translate(
            'notifications.instructors.course_edited-link_text',
            { lang },
          ),
          linkUrl:
            `${this.configService.get('SITE_URL')}/instructor/my-courses/` +
            (await resp!).course.id,
          userId: instructor.instructorId,
        });
      });
    }
    return (await resp!).course;
  }

  async addInstructorsToCourse(
    courseId: string,
    instructorEmails: string[],
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
    firstName: string,
    lastName: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new BadRequestException();
    }
    const oldInstructors = await course.courseInstructors;

    const institution = await course.institution;
    const newCourseInstructorsAdded = await this.coursesService.addInstructors(
      course,
      instructorEmails,
      authenticatedUserId,
    );
    this.sendInstructorInvitationEmails(
      newCourseInstructorsAdded,
      oldInstructors,
      course,
      firstName,
      lastName,
      institution?.language,
    );
    return true;
  }

  private async sendInstructorInvitationEmails(
    newCourseInstructorsAdded: User[],
    oldInstructors: CourseInstructor[],
    course: Course,
    firstName: string,
    lastName: string,
    institutionLanguage?: string,
  ) {
    const now = new Date();
    const notificationObjs = await Promise.all(
      oldInstructors.map(async (instructor) => {
        return {
          sentAt: now,
          title: course.name,
          linkText: this.i18n.translate(
            'notifications.instructors.instructor_added-link_text',
            { lang: institutionLanguage },
          ),
          linkUrl:
            `${this.configService.get('SITE_URL')}/instructor/my-courses/` +
            course.id,
          userId: instructor.instructorId,
        };
      }),
    );
    if (newCourseInstructorsAdded.length) {
      const instructorType_sub = this.i18n.translate('common.sub_instructor', {
        lang: institutionLanguage,
      });
      for (const newInstructor of newCourseInstructorsAdded) {
        notificationObjs.forEach((obj) => {
          this.notificationQueue.add('triggered', {
            ...obj,
            text: this.i18n.translate(
              'notifications.instructors.instructor_added-text',
              {
                args: {
                  instructorName: `${newInstructor.firstName} ${newInstructor.lastName}`,
                  instructorType: 'co-instructor',
                },
                lang: institutionLanguage,
              },
            ),
          });
        });
        this.notificationQueue.add('triggered', {
          sentAt: now,
          title: course.name,
          text: this.i18n.translate(
            'notifications.instructors.added_to_course-text',
            {
              args: { instructorType: instructorType_sub },
              lang: institutionLanguage,
            },
          ),
          linkText: this.i18n.translate(
            'notifications.instructors.added_to_course-link_text',
            { lang: institutionLanguage },
          ),
          linkUrl:
            `${this.configService.get('SITE_URL')}/instructor/my-courses/` +
            course.id,
          userId: newInstructor.id,
        });
        await this.emailService.sendCourseAssignNotificationEmailToInstructor(
          newInstructor.email,
          course.name,
          `${firstName} ${lastName}`,
          `${process.env.SITE_URL}/instructor/my-courses/${course.id}`,
          institutionLanguage,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  async removeInstructorsFromCourse(
    courseId: string,
    removedInstructors: string | string[],
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new BadRequestException();
    }

    // Ensure removeInstructorBody is an array
    if (typeof removedInstructors === 'string') {
      removedInstructors = [removedInstructors];
    }

    await this.coursesService.removeInstructors(course, removedInstructors);
    return true;
  }

  async removeStudentsFromCourse(
    courseId: string,
    removedStudents: string | string[],
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new BadRequestException();
    }

    // Ensure removeStudentsBody is an array
    if (typeof removedStudents === 'string') {
      removedStudents = [removedStudents];
    }

    await this.coursesService.removeStudents(course, removedStudents);
    return true;
  }

  async addStudentsToCourse(
    courseId: string,
    studentDtos: StudentDto[],
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
    firstName: string,
    lastName: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new BadRequestException();
    }

    const institution = await course.institution;
    const { newUsers: newStudents, newCourseUsersAdded } =
      await this.coursesService.addStudents(
        course,
        studentDtos,
        authenticatedUserId,
        role === Role.INSTITUTE_ADMIN,
      );
    this.sendStudentInvitationEmails(
      newStudents,
      newCourseUsersAdded,
      course,
      firstName,
      lastName,
      institution?.language,
    );
    return true;
  }

  private async sendStudentInvitationEmails(
    newStudents: UserWithInvitationLink[],
    newCourseUsersAdded: User[],
    course: Course,
    firstName: string,
    lastName: string,
    institutionLanguage?: string,
  ) {
    const now = new Date();
    const lang = (await course.institution)?.language;
    const notificationObjs: {
      name: 'scheduled' | 'triggered';
      data: Partial<UserNotification>;
      opts?: BulkJobOptions;
    }[] = [];
    if (newStudents.length) {
      for (const newStudent of newStudents) {
        await this.emailService.sendInvitationEmail(
          `${newStudent.firstName} ${newStudent.lastName}`,
          newStudent.email,
          newStudent.invitationLink!,
          institutionLanguage,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    if (newCourseUsersAdded.length) {
      for (const newStudentEmail of newCourseUsersAdded) {
        notificationObjs.push({
          name: 'triggered',
          data: {
            sentAt: now,
            title: course.name,
            text: this.i18n.translate(
              'notifications.students.added_to_course-text',
              { lang },
            ),
            linkText: this.i18n.translate(
              'notifications.students.added_to_course-link_text',
              { lang },
            ),
            linkUrl:
              `${this.configService.get('SITE_URL')}/student/my-courses/` +
              course.id,
            userId: newStudentEmail.id,
          },
        });
        await this.emailService.sendCourseAssignNotificationEmailToStudent(
          newStudentEmail.email,
          course.name,
          `${firstName} ${lastName}`,
          `${process.env.SITE_URL}/student/my-courses/${course.id}`,
          institutionLanguage,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      this.notificationQueue.addBulk(notificationObjs);
    }
  }

  async addProblemToCourse(
    courseId: string,
    problemId: string,
    addProblemBody: AddProblemToCourseDto,
    authenticatedUserId: UUID,
    role: Role,
    institutionId: string,
  ) {
    let where: FindOptionsWhere<Course> = {
      institutionId,
      id: courseId,
    };

    if (role === Role.INSTRUCTOR) {
      where = {
        ...where,
        courseInstructors: {
          instructorId: authenticatedUserId,
          instructorType: InstructorType.MAIN,
        },
      };
    }

    const course = await this.coursesService.findOne(where);
    if (!course) {
      throw new BadRequestException();
    }
    return await this.coursesService.addProblemToCourse(
      course,
      problemId,
      addProblemBody,
      authenticatedUserId,
    );
  }
}
