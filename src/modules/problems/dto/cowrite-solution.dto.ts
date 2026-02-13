import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CowriteProblemDto } from './cowrite-problem.dto';

export class CowriteSolutionDto extends CowriteProblemDto {
  @ApiProperty({ example: 'Essential concepts related to the problem.' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  essentialConcepts?: string;

  @ApiProperty({ example: 'Connection between different concepts.' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  conceptsConnection?: string;

  @ApiProperty({ example: 'List of assumptions for the problem.' })
  @IsNotEmpty()
  @IsString()
  assumptions: string;

  @ApiProperty({ example: 'Common mistakes made in solving the problem.' })
  @IsNotEmpty()
  @IsString()
  commonMistakes: string;

  @ApiProperty({ example: 'Additional information for the problem.' })
  @IsNotEmpty()
  @IsString()
  additionalInformation: string;

  @ApiProperty({ example: 'Instructor plan for teaching the problem.' })
  @IsNotEmpty()
  @IsString()
  instructorPlan: string;
}
