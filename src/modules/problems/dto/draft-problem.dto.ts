import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProblemDto } from './create-problem.dto';
import { IsOptional } from 'class-validator';

export class DraftProblemDto extends PartialType(CreateProblemDto) {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiPropertyOptional()
  @IsOptional()
  problemId?: string;
}
