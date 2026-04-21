import { Controller, Get, Query } from '@nestjs/common';
import { AvailableSeatsDto } from './dto/available-seats.dto';
import { SeatsService } from './seats.service';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('available')
  getAvailable(@Query() dto: AvailableSeatsDto) {
    return this.seatsService.getAvailableSeats(dto);
  }
}
