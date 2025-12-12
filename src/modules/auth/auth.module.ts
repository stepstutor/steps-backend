import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { UsersModule } from '../user/users.module';

@Module({
  imports: [PassportModule, UsersModule],
  providers: [AuthService, SupabaseStrategy],
})
export class AuthModule {}
