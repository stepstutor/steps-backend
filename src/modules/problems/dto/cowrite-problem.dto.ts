import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CowriteProblemDto {
  @ApiProperty({ example: 'Acute Myocardial Infarction Case' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Clinical reasoning exercise for cardiology fellows.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example:
      'A 58-year-old patient presents with chest pain and diaphoresis...',
  })
  @IsNotEmpty()
  @IsString()
  statement: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsNotEmpty()
  @IsString()
  discipline: string;

  @ApiProperty({ example: 'problem-uuid' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  problemId: string;
}
