import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Role } from '@common/enums/userRole';
import { User } from '@modules/user/entities/user.entity';
import { Course } from '@modules/courses/entities/course.entity';

import { DashboardStatsDto } from './types/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private datasource: DataSource) {}

  async getDashboardStats(institutionId?: string) {
    const userRepo = this.datasource.getRepository(User);
    const courseRepo = this.datasource.getRepository(Course);
    const [
      activeCourseCount,
      inActiveCourseCount,
      activeStudentCount,
      activeInstructorCount,
    ] = await Promise.all([
      courseRepo.count({
        where: { ...(institutionId && { institutionId }), isActive: true },
      }),
      courseRepo.count({
        where: { ...(institutionId && { institutionId }), isActive: false },
      }),
      userRepo.count({
        where: {
          ...(institutionId && { institutionId }),
          isActive: true,
          role: Role.STUDENT,
        },
      }),
      userRepo.count({
        where: {
          ...(institutionId && { institutionId }),
          isActive: true,
          role: Role.INSTRUCTOR,
        },
      }),
    ]);
    return new DashboardStatsDto(
      activeCourseCount,
      inActiveCourseCount,
      activeStudentCount,
      activeInstructorCount,
    );
  }
}
