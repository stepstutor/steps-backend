import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { StudentYear } from '@common/enums/studentYear';

export class CreateCourseDto {
  @ApiProperty({ example: 'Course A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'This course tests the student in his diagnostic abilities for hear diseases.',
  })
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @ApiProperty({ example: 'Fall 2024' })
  timePeriod: string;

  @IsOptional()
  @ApiProperty({ example: 'green' })
  courseColor: string;

  @ApiProperty({ example: 'Medicine' })
  @IsNotEmpty()
  programOfCourse: string;

  @IsOptional()
  @ApiProperty()
  yearOfStudent: StudentYear;

  @IsOptional()
  @ApiProperty()
  students: StudentDto[];

  @IsNotEmpty()
  @ApiProperty({ example: 'instructor-a@test.com' })
  mainInstructor: string;

  @IsOptional()
  @ApiProperty({ example: ['instructor-b@test.com', 'instructor-c@test.com'] })
  subInstructors: string[];
}

export class StudentDto {
  @ApiProperty({ example: 'john' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'student-a@test.com' })
  @IsNotEmpty()
  email: string;
}
