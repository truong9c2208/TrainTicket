import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('train-revenue')
  getTrainRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getTrainRevenue(startDate, endDate);
  }

  @Get('route-revenue')
  getRouteRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getRouteRevenue(startDate, endDate);
  }
}
