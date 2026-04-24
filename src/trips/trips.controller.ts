import { Controller, Get, Param, Query, Post, Body, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  create(@Body() body: any) {
    return this.tripsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.tripsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.remove(id);
  }

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  setSchedule(@Param('id', ParseIntPipe) id: number, @Body('stations') stations: any[]) {
    return this.tripsService.setSchedule(id, stations);
  }

  @Post(':id/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  setSegmentPrices(@Param('id', ParseIntPipe) id: number, @Body('prices') prices: any[]) {
    return this.tripsService.setSegmentPrices(id, prices);
  }
}
