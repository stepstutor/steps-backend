import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Title of the category' })
  @IsString()
  title: string;
}
