// **** Library Imports ****
import { UUID } from 'crypto';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { FindOptionsWhere } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { NOTIFICATION_QUEUE_NAME } from '@common/constants';
import { EmailService } from '@common/services/email.service';
import { NotificationJob } from '@modules/notifications/entities/notification.entity';
import { UserNotification } from '@modules/notifications/entities/userNotification.entity';

// **** Internal Imports ****
import { Course } from '../entities/course.entity';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from '../dto/createCourse.dto';
import { GetCoursesQueryDto } from '../dto/getCoursesQuery.dto';

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
    const courses = await this.coursesService.findAll(
      where,
      page,
      limit,
      sortBy,
      sortOrder,
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

    return courses.map((course, i) => {
      return {
        course,
        instructorsCount: coursesInstructors[i].length,
        studentsCount: coursesStudents[i].length,
        mainInstructor: coursesMainInstructors[i],
      };
    });
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
}
