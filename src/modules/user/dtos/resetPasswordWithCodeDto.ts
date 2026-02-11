import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordWithCodeDto {
  @ApiProperty({ example: 'your-new-password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'abc123def456...' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
