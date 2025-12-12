import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../courses/courses.module';
import { NotificationJob } from './entities/notification.entity';
import { UserNotification } from './entities/userNotification.entity';
import { NotificationJobsService } from './services/notificationJobs.service';
import { UserNotificationsService } from './services/userNotifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { UsersModule } from '../user/users.module';
import { InstitutionsModule } from '../institutions/institutions.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => CoursesModule),
    InstitutionsModule,
    TypeOrmModule.forFeature([NotificationJob, UserNotification]),
    forwardRef(() => CommonModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationJobsService, UserNotificationsService],
  exports: [UserNotificationsService, NotificationJobsService],
})
export class NotificationsModule {}
