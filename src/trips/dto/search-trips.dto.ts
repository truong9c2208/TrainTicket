import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SearchTripsDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
