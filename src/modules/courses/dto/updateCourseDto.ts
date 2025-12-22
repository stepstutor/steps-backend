import { CreateCourseDto } from './createCourse.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

export class UpdateCourseDto extends OmitType(PartialType(CreateCourseDto), [
  'students',
  'subInstructors',
]) {
  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isActive: boolean;
}
