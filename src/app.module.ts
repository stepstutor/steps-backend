// **** Library Imports ****
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

// **** External Imports ****
import {
  ResponseInterceptor,
  RequestLoggingInterceptor,
} from '@common/interceptors';
import { CommonModule } from '@common/common.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TagsModule } from '@modules/tags/tags.module';
import { UsersModule } from '@modules/user/users.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { QueriesModule } from '@modules/queries/queries.module';
import { ArticlesModule } from '@modules/articles/articles.module';
import { ProblemsModule } from '@modules/problems/problems.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { LogsAndTracksModule } from '@modules/logs-and-tracks/logs-and-tracks.module';

@Module({
  imports: [
    AuthModule,
    TagsModule,
    UsersModule,
    CommonModule,
    CoursesModule,
    QueriesModule,
    ArticlesModule,
    ProblemsModule,
    DashboardModule,
    InvitationsModule,
    InstitutionsModule,
    LogsAndTracksModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
