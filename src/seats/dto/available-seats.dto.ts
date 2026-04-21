import { IsNotEmpty, IsString } from 'class-validator';

export class AvailableSeatsDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  from!: string;

  @IsString()
  @IsNotEmpty()
  to!: string;
}
