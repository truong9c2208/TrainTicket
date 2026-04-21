import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchStationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  q?: string;
}
