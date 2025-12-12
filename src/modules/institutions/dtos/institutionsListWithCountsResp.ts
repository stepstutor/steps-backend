import { Institution } from '../entities/institutions.entity';

export type InstitutionWithCounts = Institution & {
  studentsCount: number;
  instructorsCount: number;
  coursesCount: number;
};

export type InstitutionWithCourses = {
  id: string;
  name: string;
  courses: { courseId: string; name: string }[];
  country: string;
  coursesCount: number;
};
