import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of active Courses' })
  activeCourses: number;

  @ApiProperty({ description: 'Total number of archived/inActive Courses' })
  inActiveCourseCount: number;

  @ApiProperty({ description: 'Total number of active students' })
  activeStudents: number;

  @ApiProperty({ description: 'Total number of active instructors' })
  activeInstructors: number;

  constructor(
    activeCourses: number,
    inActiveCourseCount: number,
    activeStudents: number,
    activeInstructors: number,
  ) {
    this.activeCourses = activeCourses;
    this.activeStudents = activeStudents;
    this.activeInstructors = activeInstructors;
    this.inActiveCourseCount = inActiveCourseCount;
  }
}
