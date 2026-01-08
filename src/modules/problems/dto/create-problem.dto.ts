import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProblemDto {
  @ApiProperty({ example: 'Acute Myocardial Infarction Case' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Clinical reasoning exercise for cardiology fellows.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example:
      'A 58-year-old patient presents with chest pain and diaphoresis...',
  })
  @IsNotEmpty()
  statement: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsNotEmpty()
  discipline: string;

  @ApiProperty({
    example: 'Coronary artery occlusion, troponin interpretation, ECG changes.',
  })
  @IsNotEmpty()
  essentialConcepts: string;

  @ApiProperty({
    example:
      'Explores links between ischemia, biomarkers, and imaging findings.',
  })
  @IsNotEmpty()
  conceptsConnection: string;

  @ApiProperty({
    example: 'Assume timely access to cath lab and standard lab panels.',
  })
  @IsNotEmpty()
  assumptions: string;

  @ApiProperty({ example: 'Commonly confuse STEMI and NSTEMI criteria.' })
  @IsNotEmpty()
  commonMistakes: string;

  @ApiProperty({
    example: 'Include telemetry data and prior stress test results.',
  })
  @IsNotEmpty()
  additionalInformation: string;

  @ApiProperty({
    example:
      'Guide discussion through symptom review, diagnostics, and escalation steps.',
  })
  @IsNotEmpty()
  instructorPlan: string;

  @ApiProperty({
    example: '1. Start aspirin and nitrates; 2. Activate cath lab...',
  })
  @IsNotEmpty()
  solutionKey: string;

  @ApiProperty({
    example: 'Summarize STEMI criteria and next steps for post-PCI care.',
  })
  @IsNotEmpty()
  wrapUp: string;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  publishToInstitutionLibrary: boolean;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  publishToPublicLibrary: boolean;

  @ApiProperty({ example: ['tag1', 'tag2', 'tag3'] })
  @IsArray()
  @ArrayMaxSize(2)
  @IsUUID('4', { each: true })
  problemTags?: string[];
}
