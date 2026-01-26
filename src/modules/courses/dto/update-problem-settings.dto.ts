import { PartialType } from '@nestjs/swagger';
import { AddProblemToCourseDto } from './add-problem-to-course.dto';

export class UpdateCourseProblemSettingsDto extends PartialType(
  AddProblemToCourseDto,
) {}
