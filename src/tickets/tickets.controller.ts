import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/types';
import { BookTicketDto } from './dto/book-ticket.dto';
import { CancelTicketDto } from './dto/cancel-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.ticketsService.listMyTickets(user.userId);
  }

  @Post('book')
  book(@CurrentUser() user: AuthUser, @Body() dto: BookTicketDto) {
    return this.ticketsService.book(user, dto);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: AuthUser, @Body() dto: CancelTicketDto) {
    return this.ticketsService.cancel(user, dto);
  }
}
