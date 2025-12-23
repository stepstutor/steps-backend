import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OpenAiCallsType } from 'src/common/enums/open-ai-calls-type';

export class CreateOpenAICallLog {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty()
  @IsEnum(OpenAiCallsType)
  type: OpenAiCallsType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  clinicalActivityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  clinicalActivityPerformId?: string;
}
