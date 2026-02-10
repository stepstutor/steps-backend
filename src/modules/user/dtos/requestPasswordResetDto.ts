import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
