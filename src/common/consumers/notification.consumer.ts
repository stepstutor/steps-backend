import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE_NAME } from '../constants';
import { UserNotificationsService } from 'src/modules/notifications/services/userNotifications.service';
import { UserNotification } from 'src/modules/notifications/entities/userNotification.entity';
import { NotificationJob } from 'src/modules/notifications/entities/notification.entity';
import { NotificationJobsService } from 'src/modules/notifications/services/notificationJobs.service';
import { EmailService } from '../services/email.service';

@Processor(NOTIFICATION_QUEUE_NAME)
export class NotificationConsumer extends WorkerHost {
  constructor(
    private readonly userNotificationService: UserNotificationsService,
    private readonly notificationJobsService: NotificationJobsService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(
    job: Job<
      Partial<UserNotification> | Partial<UserNotification>[] | NotificationJob,
      boolean,
      'scheduled' | 'triggered'
    >,
  ): Promise<any> {
    if (job.name === 'scheduled') {
      const notification = job.data as unknown as NotificationJob;
      if (notification.sendEmail) {
        const userEmails = await this.notificationJobsService.getReceiverIds(
          notification,
          true,
        );
        this.emailService.sendAnnouncementEmail(
          userEmails,
          notification.title,
          notification.text,
          notification.linkUrl,
          notification.linkText,
        );
      }
      await this.notificationJobsService.sendOutNotificationFromJob(
        notification,
      );
      this.notificationJobsService.update(notification.id, { isSent: true });
    } else {
      if (Array.isArray(job.data)) {
        const notifications = await this.userNotificationService.bulkCreate(
          job.data,
        );
        if (!notifications) {
          throw new Error('Failed to create notification');
        }
        return true;
      }
      const userNotification = await this.userNotificationService.create(
        job.data,
      );
      if (!userNotification) {
        throw new Error('Failed to create notification');
      }
      return true;
    }
  }
}
