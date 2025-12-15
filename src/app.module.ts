import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CoursesModule } from './modules/courses/courses.module';
import { CommonModule } from '@common/common.module';
import { AuthModule } from '@modules/auth/auth.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { UsersModule } from '@modules/user/users.module';
import { ResponseInterceptor } from '@common/interceptors';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommonModule,
    CoursesModule,
    InvitationsModule,
    InstitutionsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
