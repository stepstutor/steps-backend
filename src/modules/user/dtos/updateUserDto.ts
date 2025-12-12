import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiPropertyOptional()
  firstName: string;

  @IsOptional()
  @ApiPropertyOptional()
  lastName: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsBoolean()
  isActive: boolean;
}
