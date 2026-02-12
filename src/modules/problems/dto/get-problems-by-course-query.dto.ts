import { PaginationDTO } from '@common/dto/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetProblemsByCourseQueryDto extends PaginationDTO {
  @ApiProperty({
    description: 'Filter to get only past due problems',
    required: false,
    default: false,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  getPastDueProblems: boolean;
}
