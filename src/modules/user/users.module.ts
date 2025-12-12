import { SupabaseModule } from 'nestjs-supabase-js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

// import { CoursesModule } from '@modules/courses/courses.module';
// import { InvitationsModule } from '@modules/invitations/invitations.module';
// import { Invitation } from '@modules/invitations/entities/invitation.entity';
import { InstitutionsModule } from '@modules/institutions/institutions.module';

import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersAdminController } from './controllers/usersAdmin.controller';

import { CommonModule } from '@common/common.module';
import { UploadService } from '@common/services/upload.service';
import { CoursesModule } from '@modules/courses/courses.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { Invitation } from '@modules/invitations/entities/invitation.entity';
import { UsersAdminManagerService } from './services/users.adminManager.service';
// import { CoursesModule } from '@modules/courses/courses.module';

@Module({
  imports: [
    SupabaseModule.injectClient(),
    forwardRef(() => CommonModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => InstitutionsModule),
    forwardRef(() => InvitationsModule),
    TypeOrmModule.forFeature([User, Invitation]),
  ],
  providers: [UsersService, UploadService, UsersAdminManagerService],
  controllers: [UsersController, UsersAdminController],
  exports: [UsersService],
})
export class UsersModule {}
