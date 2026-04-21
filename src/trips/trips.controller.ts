import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchTripsDto } from './dto/search-trips.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(@Query() query: SearchTripsDto) {
    return this.tripsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
