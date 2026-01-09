import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Problem } from './entities/problem.entity';
import { ProblemTag } from './entities/problem-tag.entity';
import { ProblemsService } from './services/problems.service';
import { ProblemLibrary } from './entities/problem-library.entity';
import { ProblemsController } from './controllers/problems.controller';
import { ProblemsManagerService } from './services/problems.manager.service';

import { Tag } from '@modules/tags/entities/tag.entity';
import { UsersModule } from '@modules/user/users.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { TagsModule } from '@modules/tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Problem, ProblemTag, ProblemLibrary]),
    CoursesModule,
    UsersModule,
    TagsModule,
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService, ProblemsManagerService],
})
export class ProblemsModule {}
