import { IsNotEmpty, IsInt } from 'class-validator';

export class BookTicketDto {
  @IsInt()
  @IsNotEmpty()
  tripId!: number;

  @IsInt()
  @IsNotEmpty()
  seatId!: number;

  @IsInt()
  @IsNotEmpty()
  fromStationId!: number;

  @IsInt()
  @IsNotEmpty()
  toStationId!: number;
}
