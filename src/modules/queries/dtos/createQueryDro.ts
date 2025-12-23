import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQueryDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  pictureUrl?: string;
}
