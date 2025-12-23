import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateQueryStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Open', 'Closed'])
  status: string;
}
