// Library Imports
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// External Imports
import { UsersModule } from '@modules/user/users.module';
import { CommonModule } from '@common/common.module';

// Internal Imports
import { Institution } from './entities/institutions.entity';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './controllers/institutions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Institution]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommonModule),
  ],
  providers: [InstitutionsService],
  controllers: [InstitutionsController],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
