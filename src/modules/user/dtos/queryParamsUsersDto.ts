// **** Library Imports ****
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { PaginationDTO } from '@common/dto/pagination.dto';

export class QueryParamsUsersDto extends PaginationDTO {
  @IsEnum([Role.INSTRUCTOR, Role.STUDENT], {
    each: true,
    message: 'Each value in role must be either INSTRUCTOR or STUDENT',
  })
  @ApiProperty({ isArray: true })
  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  role?: Role[];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  isMember?: boolean;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  orIsMember?: boolean;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
