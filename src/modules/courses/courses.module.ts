import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { CommonModule } from '@common/common.module';
import { UsersModule } from '@modules/user/users.module';
import { ProblemsModule } from '@modules/problems/problems.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';

import { Course } from './entities/course.entity';
import { CoursesService } from './services/courses.service';
import { CourseStudent } from './entities/course-student.entity';
import { CoursesController } from './controllers/courses.controller';
import { CourseInstructor } from './entities/course-instructor.entity';
import { CoursesManagerService } from './services/courses.manager.service';
import { CourseProblemSettings } from './entities/course-problem-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseStudent,
      CourseInstructor,
      CourseProblemSettings,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommonModule),
    forwardRef(() => ProblemsModule),
    InstitutionsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesManagerService],
  exports: [CoursesService],
})
export class CoursesModule {}
