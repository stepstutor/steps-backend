// **** Library Imports ****
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from 'nestjs-supabase-js';

// **** External Imports ****
import { CommonModule } from '@common/common.module';

// **** Internal Imports ****
import { UsersModule } from '../user/users.module';
import { Invitation } from './entities/invitation.entity';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './controllers/invitations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    SupabaseModule.injectClient(),
    forwardRef(() => UsersModule),
    forwardRef(() => CommonModule),
  ],
  providers: [InvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
