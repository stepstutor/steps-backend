import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { ReorderDto } from './reorder-articleCategories.dto';

export class ReorderArticlesDto {
  @ApiProperty({
    type: [ReorderDto],
    description: 'Array of articles with new order',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderDto)
  articles: ReorderDto[];
}
