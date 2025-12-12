import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty } from 'class-validator';

export class GetInstitutesByCountriesDto {
  @ApiProperty({
    description:
      'Array of countries to get institues for. Accepts both string and array.',
    type: [String],
    examples: [['usa', 'qatar'], 'usa'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // Force single string into an array
  countries: string[];
}
