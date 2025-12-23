import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min, IsUUID, ValidateNested } from 'class-validator';

export class ReorderDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 1, description: 'New order position' })
  @IsInt()
  @Min(1)
  order: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({
    type: [ReorderDto],
    description: 'Array of categories with new order',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderDto)
  categories: ReorderDto[];
}
