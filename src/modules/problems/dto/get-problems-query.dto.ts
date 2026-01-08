import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationDTO } from '@common/dto/pagination.dto';
import { PublicationType } from '@common/enums/publication-type';

export class GetProblemsQueryDto extends PaginationDTO {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discipline?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PublicationType)
  libraryType?: PublicationType;
}
