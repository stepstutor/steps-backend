import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/userRole';

export class QueryParamsAdminGetUsersDto {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  role?: Role;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  institutionId?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  isActive?: boolean;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  isMember?: boolean;
}
