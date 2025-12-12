// **** Library Imports ****
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';

export class QueryParamsUsersDto {
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
}
