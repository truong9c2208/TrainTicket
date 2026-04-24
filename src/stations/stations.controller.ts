import { Controller, Get, Query, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SearchStationsDto } from './dto/search-stations.dto';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  search(@Query() query: SearchStationsDto) {
    return this.stationsService.search(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  create(@Body() body: any) {
    return this.stationsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  update(@Param('id') id: string, @Body() body: any) {
    return this.stationsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}
