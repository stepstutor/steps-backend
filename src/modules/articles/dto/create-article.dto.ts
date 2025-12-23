import {
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  IsArray,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Role } from '@common/enums/userRole';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    example: 'Introduction to NestJS',
    description: 'Title of the article',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is a short blog post...',
    description: 'Blog content (max 600 characters)',
  })
  @IsString()
  @MaxLength(600)
  blogInput: string;

  @ApiProperty({
    example: 'https://example.com/video.mp4',
    description: 'Video link for the article',
  })
  @IsOptional()
  video: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'Image link for the article',
  })
  @IsOptional()
  image: string;

  @ApiProperty({
    example: 1,
    description: 'Category ID associated with the article',
  })
  @IsUUID()
  articleCategoryId: string;

  @ApiProperty({
    example: [Role.INSTRUCTOR, Role.STUDENT],
    description: 'Roles that can access this article',
    enum: Role,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  availableFor: Role[];

  @ApiProperty({ example: 1, description: 'Order of the article' })
  @IsInt()
  @Min(1)
  order: number;
}
