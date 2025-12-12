import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from 'nestjs-supabase-js';
import { InvitationsService } from './invitations.service';
import { UsersModule } from '../user/users.module';
import { InvitationsController } from './controllers/invitations.controller';
import { Invitation } from './entities/invitation.entity';
import { CommonModule } from 'src/common/common.module';

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
