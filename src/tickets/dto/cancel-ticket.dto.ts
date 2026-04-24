import { IsNotEmpty, IsInt } from 'class-validator';

export class CancelTicketDto {
  @IsInt()
  @IsNotEmpty()
  ticketId!: number;
}
