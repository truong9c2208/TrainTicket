import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailableSeatsDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  tripId!: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  from!: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  to!: number;
}
