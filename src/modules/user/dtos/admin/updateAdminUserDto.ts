import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAdminUserDto {
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

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  institutionId?: string;
}
