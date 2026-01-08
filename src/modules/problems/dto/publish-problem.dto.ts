import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { PublicationType } from '@common/enums/publication-type';

export class PublishProblemDto {
  @ApiProperty({
    description: 'The type of publication, either INSTITUTION or PUBLIC',
    enum: PublicationType,
  })
  @IsString()
  @IsEnum(PublicationType)
  publicationType: PublicationType;
}
