import { IsDateString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  from?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  to?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
