import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Role } from '@common/enums/userRole';
import { NOTIFICATION_QUEUE_NAME } from '@common/constants';
import { EmailService } from '@common/services/email.service';
import { UsersService } from '@modules/user/services/users.service';
import { ReceiverGroup } from '@common/enums/notificationReceiverGroup';
import { CoursesService } from '@modules/courses/services/courses.service';

import { NotificationJob } from '../entities/notification.entity';
import { UserNotification } from '../entities/userNotification.entity';
import { UserNotificationsService } from './userNotifications.service';

@Injectable()
export class NotificationJobsService {
  constructor(
    @InjectRepository(NotificationJob)
    private readonly notificationRepository: Repository<NotificationJob>,
    private readonly userNotificationsService: UserNotificationsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    @InjectQueue(NOTIFICATION_QUEUE_NAME)
    private readonly notificationQueue: Queue<
      Partial<UserNotification> | NotificationJob,
      boolean,
      'scheduled' | 'triggered'
    >,
  ) {}

  /**
   * Create a new notification
   */
  async create(
    notificationData: Partial<NotificationJob>,
  ): Promise<NotificationJob> {
    const notificationObj =
      this.notificationRepository.create(notificationData);
    const notification =
      await this.notificationRepository.save(notificationObj);
    if (!notification.scheduleDate) {
      if (notification.sendEmail) {
        const userEmails = await this.getReceiverIds(notification, true);
        this.emailService.sendAnnouncementEmail(
          userEmails,
          notification.title,
          notification.text,
          notification.linkUrl,
          notification.linkText,
        );
      }
      await this.sendOutNotificationFromJob(notification);
      notification.isSent = true;
    } else {
      const job = await this.notificationQueue.add('scheduled', notification, {
        delay: new Date(notification.scheduleDate).getTime() - Date.now(),
      });
      notification.isSent = false;
      notification.queueJobId = job.id!;
    }
    const updatedNotificationJob =
      await this.notificationRepository.save(notification);
    return updatedNotificationJob;
  }

  async sendOutNotificationFromJob(
    notification: NotificationJob,
  ): Promise<void> {
    const receiverIds = await this.getReceiverIds(notification);
    const now = new Date();
    const bulkCreateArray: Partial<UserNotification>[] = receiverIds.map(
      (receiverId) => {
        return {
          notificationId: notification.id,
          userId: receiverId,
          title: notification.title,
          text: notification.text,
          linkUrl: notification.linkUrl,
          linkText: notification.linkText,
          sentAt: now,
        };
      },
    );
    await this.userNotificationsService.bulkCreate(bulkCreateArray);
  }

  async getReceiverIds(
    notification: NotificationJob,
    returnEmails: boolean = false,
  ): Promise<string[]> {
    const rolesArray: Role[] =
      notification.receiverGroup === ReceiverGroup.BOTH
        ? [Role.STUDENT, Role.INSTRUCTOR]
        : [notification.receiverGroup as unknown as Role];
    if (notification.receiverCourseIds !== null) {
      // Get all users in the specified courses
      const courseUserIds = await this.coursesService.getCourseUserIds(
        notification.receiverCourseIds,
        notification.receiverGroup,
      );
      if (returnEmails) {
        const users = await this.usersService.findAll(
          { id: In(courseUserIds) },
          { email: true },
        );
        return users.map((user) => user.email);
      }
      return courseUserIds;
    }
    if (
      notification.receiverInstituteIds === null &&
      notification.receiverCountry === null
    ) {
      // Get all users
      const allUsers = await this.usersService.findAll(
        {
          role: In(rolesArray),
          isActive: true,
        },
        { id: true, email: true },
      );
      return allUsers.map((user) => (returnEmails ? user.email : user.id));
    } else {
      // Get all users in the specified institutes or countries
      return await this.usersService.findUsersByInstituteAndCountry(
        rolesArray,
        notification.receiverInstituteIds,
        notification.receiverCountry,
        returnEmails,
      );
    }
  }

  /**
   * Update an existing notification
   */
  async update(
    id: string,
    updateData: Partial<NotificationJob>,
  ): Promise<NotificationJob> {
    const existingNotification =
      await this.notificationRepository.findOneOrFail({
        where: { id, isSent: false },
      });
    await this.notificationRepository.update(id, updateData);
    const updatedJob = await this.notificationRepository.findOneOrFail({
      where: { id },
    });
    if (existingNotification.queueJobId) {
      const job = await this.notificationQueue.getJob(
        existingNotification.queueJobId,
      );
      if (updateData.scheduleDate) {
        if (updateData.scheduleDate !== existingNotification.scheduleDate) {
          await job?.changeDelay(
            new Date(updateData.scheduleDate).getTime() - Date.now(),
          );
        }
        await job?.updateData(updatedJob);
      } else {
        await job?.remove();
        await this.sendOutNotificationFromJob(updatedJob);
        updatedJob.scheduleDate = null;
        updatedJob.isSent = true;
        await this.notificationRepository.save(updatedJob);
      }
    }
    return updatedJob;
  }

  /**
   * Find all notifications with a generic where clause
   */
  async findAll(
    where?: FindOptionsWhere<NotificationJob>,
  ): Promise<NotificationJob[]> {
    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one notification by a generic where clause
   */
  async findOne(
    where: FindOptionsWhere<NotificationJob>,
  ): Promise<NotificationJob | null> {
    return this.notificationRepository.findOne({ where });
  }

  /**
   * Delete a notification
   */
  async remove(id: string): Promise<void> {
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id },
    });
    if (!notification) {
      throw new BadRequestException();
    } else if (notification.isSent) {
      throw new BadRequestException(
        'Cannot delete a notification that has been sent',
      );
    }
    await this.notificationRepository.delete(id);
  }
}
