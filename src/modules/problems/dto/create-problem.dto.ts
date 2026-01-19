import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProblemDto {
  @ApiProperty({ example: 'Acute Myocardial Infarction Case' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Clinical reasoning exercise for cardiology fellows.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example:
      'A 58-year-old patient presents with chest pain and diaphoresis...',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  statement: string;

  @ApiProperty({ example: 'Cardiology' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  discipline: string;

  @ApiProperty({
    example: 'Coronary artery occlusion, troponin interpretation, ECG changes.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  essentialConcepts: string;

  @ApiProperty({
    example:
      'Explores links between ischemia, biomarkers, and imaging findings.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  conceptsConnection: string;

  @ApiProperty({
    example: 'Assume timely access to cath lab and standard lab panels.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsOptional()
  assumptions?: string;

  @ApiProperty({ example: 'Commonly confuse STEMI and NSTEMI criteria.' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  commonMistakes: string;

  @ApiProperty({
    example: 'Include telemetry data and prior stress test results.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  additionalInformation: string;

  @ApiProperty({
    example:
      'Guide discussion through symptom review, diagnostics, and escalation steps.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  instructorPlan: string;

  @ApiProperty({
    example: '1. Start aspirin and nitrates; 2. Activate cath lab...',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  solutionKey: string;

  @ApiProperty({
    example: 'Summarize STEMI criteria and next steps for post-PCI care.',
  })
  @ValidateIf((o) => !o.isDraft)
  @IsOptional()
  @IsNotEmpty()
  wrapUp: string;

  @ApiProperty({ example: false })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  publishToInstitutionLibrary: boolean;

  @ApiProperty({ example: false })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  publishToPublicLibrary: boolean;

  @ApiProperty({ example: ['tag1', 'tag2', 'tag3'] })
  @ValidateIf((o) => !o.isDraft)
  @IsArray()
  @ArrayMaxSize(2)
  problemTags?: string[];

  @ApiProperty({
    description: 'Whether to include solutions with the published problem',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeSolutionKey: boolean;

  @ApiProperty({
    description:
      'Whether to include wrap-up section with the published problem',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeWrapUp: boolean;
}
