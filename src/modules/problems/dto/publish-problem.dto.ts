import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

import { PublicationType } from '@common/enums/publication-type';

export class PublishProblemDto {
  @ApiProperty({
    description: 'The type of publication, either INSTITUTION or PUBLIC',
    enum: PublicationType,
  })
  @IsString()
  @IsEnum(PublicationType)
  publicationType: PublicationType;

  @ApiProperty({
    description: 'Whether to include solutions with the published problem',
    example: true,
  })
  @IsBoolean()
  includeSolutionKey: boolean;

  @ApiProperty({
    description:
      'Whether to include wrap-up section with the published problem',
    example: true,
  })
  @IsBoolean()
  includeWrapUp: boolean;
}
