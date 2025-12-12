import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ArchiveUsersDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  // @Transform((value) => (Array.isArray(value) ? value : [value]))
  ids: string[];
}
