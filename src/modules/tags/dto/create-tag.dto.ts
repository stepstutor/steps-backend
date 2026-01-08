import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Cardiology' })
  @IsNotEmpty()
  name: string;
}
