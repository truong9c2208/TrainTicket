import { IsNotEmpty, IsString } from 'class-validator';

export class BookTicketDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  seatId!: string;

  @IsString()
  @IsNotEmpty()
  fromStationId!: string;

  @IsString()
  @IsNotEmpty()
  toStationId!: string;
}
