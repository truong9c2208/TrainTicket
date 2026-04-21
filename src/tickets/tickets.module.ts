import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [TripsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
