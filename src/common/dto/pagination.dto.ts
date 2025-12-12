import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDTO<T extends string = string> {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;

  @IsString()
  @IsOptional()
  sortBy?: T;

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
