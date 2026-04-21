import { IsNotEmpty, IsString } from 'class-validator';

export class CancelTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketId!: string;
}
