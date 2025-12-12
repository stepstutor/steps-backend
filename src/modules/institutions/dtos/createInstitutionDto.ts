import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

import { Language } from '@common/enums/language';

export class CreateInstitutionDto {
  @ApiProperty()
  @IsNotEmpty()
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
  isActive: boolean;

  @IsBoolean()
  @ApiProperty()
  isVoiceCallAllowed: boolean;

  @ApiProperty()
  @IsNotEmpty()
  adminFirstName: string;

  @ApiProperty()
  @IsNotEmpty()
  adminLastName: string;
  @ApiProperty()
  @IsNotEmpty()
  adminEmail: string;
}
