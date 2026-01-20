import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class AddProblemToCourseDto {
  @ApiPropertyOptional({
    description: 'Enable planning workflow for the problem',
  })
  @IsOptional()
  @IsBoolean()
  hasPlanning?: boolean;

  @ApiPropertyOptional({
    description: 'Enable reflection workflow for the problem',
  })
  @IsOptional()
  @IsBoolean()
  hasReflection?: boolean;

  @ApiPropertyOptional({
    description: 'Release date for the planning portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  planningReleaseDate?: string | null;

  @ApiPropertyOptional({
    description: 'Due date for the planning portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  planningDueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Release date for the reflection portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  reflectionReleaseDate?: string | null;

  @ApiPropertyOptional({
    description: 'Due date for the reflection portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  reflectionDueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Mark the reflection as optional for students',
  })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({
    description: 'Mark the problem as a draft within the course',
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: 'Require solution submission for the problem',
  })
  @IsOptional()
  @IsBoolean()
  requireSolution?: boolean;
}
