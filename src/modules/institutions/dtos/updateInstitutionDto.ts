// Library imports
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

// External imports
import { Language } from '@common/enums/language';

export class UpdateInstitutionDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @IsOptional()
  @ApiProperty()
  country: string;

  @IsOptional()
  @ApiProperty()
  language: Language;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  instructorAccountsLimit: number;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  studentAccountsLimit: number;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isActive: boolean;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isVoiceCallAllowed: boolean;
}
