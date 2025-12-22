// **** Libray Imports ****
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// **** External Imports ****
import { PaginationDTO } from '@common/dto/pagination.dto';

export class GetCoursesQueryDto extends PaginationDTO {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timePeriod?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discipline?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainInstructorId?: string;
}
