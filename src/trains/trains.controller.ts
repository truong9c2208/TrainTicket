import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainsService } from './trains.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('trains')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Get()
  @Roles('MANAGER', 'CUSTOMER') // Allow both to view trains
  findAll() {
    return this.trainsService.findAll();
  }

  @Get(':id')
  @Roles('MANAGER', 'CUSTOMER')
  findOne(@Param('id') id: string) {
    return this.trainsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.trainsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.trainsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainsService.remove(id);
  }

  @Post(':id/coaches')
  addCoach(@Param('id') trainId: string, @Body() data: any) {
    return this.trainsService.addCoach(trainId, data);
  }

  @Delete('coaches/:coachId')
  removeCoach(@Param('coachId') coachId: string) {
    return this.trainsService.removeCoach(coachId);
  }

  @Post('coaches/:coachId/seats')
  addSeat(@Param('coachId') coachId: string, @Body() data: any) {
    return this.trainsService.addSeat(coachId, data);
  }

  @Delete('seats/:seatId')
  removeSeat(@Param('seatId') seatId: string) {
    return this.trainsService.removeSeat(seatId);
  }
}
